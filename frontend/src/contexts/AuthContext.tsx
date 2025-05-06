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

  const fetchMe = async (jwt: string) => {
    const res = await api.get<User>("/users/me", {
      headers: { Authorization: `Bearer ${jwt}` },
    });
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
    await fetchMe(jwt);
  };

  const login = async () => {
    try {
      // tenta popup, se funcionar já retorna o idToken
      const idToken = await loginWithGoogle();
      if (idToken) {
        await exchangeAndStoreToken(idToken);
        // redireciona no cliente sem React Router
        window.location.href = "/";
      }
      // se for redirect, o fluxo seguirá em handleRedirectLogin()
    } catch (err) {
      console.error("Erro no login:", err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    // joga pra tela de login
    window.location.href = "/login";
  };

  useEffect(() => {
    (async () => {
      try {
        const idToken = await handleRedirectLogin();
        if (idToken) {
          await exchangeAndStoreToken(idToken);
          // só redireciona após troca de token e fetch de usuário
          window.location.href = "/";
        } else if (token) {
          await fetchMe(token);
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