// src/contexts/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api } from "@/lib/api";
import { loginWithGoogle, handleRedirectLogin } from "@/firebase";

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
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [initialized, setInitialized] = useState(false);

  const fetchMe = async () => {
    const res = await api.get<User>("/users/me");
    setUser(res.data);
  };

  const exchangeAndStoreToken = async (idToken: string) => {
    const { data } = await api.post<{ access_token: string }>(
      "/auth/login/firebase",
      { idToken }
    );
    const jwt = data.access_token;
    localStorage.setItem("token", jwt);
    setToken(jwt);
    api.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
    await fetchMe();
  };

  const login = async () => {
    try {
      // Tentar popup; se não vier, seguirá para redirect flow
      const idToken = await loginWithGoogle();
      if (idToken) {
        await exchangeAndStoreToken(idToken);
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Erro no login:", err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    window.location.href = "/login";
  };

  useEffect(() => {
    (async () => {
      try {
        // Se veio via redirect OAuth
        const idToken = await handleRedirectLogin();
        if (idToken) {
          await exchangeAndStoreToken(idToken);
          window.location.href = "/";
          return;
        }
        // Se já havia token salvo
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          await fetchMe();
        }
      } catch (err) {
        console.error("Auth init error:", err);
        logout();
      } finally {
        setInitialized(true);
      }
    })();
  }, []); // Runs only once during initialization

  // Effect to fetch user data when a valid token is set
  useEffect(() => {
    if (token) {
      (async () => {
        try {
          await fetchMe(token);
        } catch (err) {
          console.error("Error fetching user data:", err);
          logout();
        }
      })();
    }
  }, [token]); // Runs whenever the token changes
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-700">Carregando autenticação...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
