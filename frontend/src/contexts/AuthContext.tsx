// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api } from "@/lib/api";
import { loginWithGoogle } from "@/firebase";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";

export type User = {
  id: string;
  email: string;
  nickname: string;
  full_name: string;
  is_iconic: boolean;
  role: string;
};

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isIconic: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  token: null,
  isIconic: false,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [isIconic, setIsIconic] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fetchMe = async () => {
    const res = await api.get<User>("/users/me");
    setUser(res.data);
    setIsIconic(Boolean(res.data.is_iconic));
  };

  const exchangeAndStoreToken = async (idToken: string) => {
    const { data } = await api.post<{ access_token: string }>(
      "/auth/login/firebase",
      { idToken }
    );
    const jwt = data.access_token;
    localStorage.setItem("token", jwt);
    sessionStorage.setItem("firebase-authenticated", "true");
    setToken(jwt);
    api.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
    await fetchMe();
  };

  const login = async () => {
    // dispara o fluxo de login do Firebase (popup ou redirect)
    const idToken = await loginWithGoogle();
    if (idToken) {
      await exchangeAndStoreToken(idToken);
      // não precisa mais de window.location.reload(), o listener cuidará de atualizar o estado
    }
  };

  const logout = async () => {
    // limpa tokens e state
    localStorage.removeItem("token");
    sessionStorage.removeItem("firebase-authenticated");
    setToken(null);
    setUser(null);
    setIsIconic(false);
    delete api.defaults.headers.common["Authorization"];
    await signOut(auth);
  };

  useEffect(() => {
    // Se já estivermos autenticados nesta session, definimos o header e buscamos o perfil
    const prevAuth = sessionStorage.getItem("firebase-authenticated");
    if (prevAuth && token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchMe().finally(() => setInitialized(true));
    } else {
      // Senão, escutamos o estado de autenticação do Firebase
      const unsubscribe = onAuthStateChanged(
        auth,
        async (fbUser: FirebaseUser | null) => {
          if (fbUser) {
            try {
              const idToken = await fbUser.getIdToken();
              await exchangeAndStoreToken(idToken);
            } catch {
              // falha no token, força logout
              await logout();
            }
          }
          setInitialized(true);
        }
      );
      return unsubscribe;
    }
  }, [token]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-700">Carregando autenticação...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, isIconic, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);