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

  const login = async () => {
    const idToken = await loginWithGoogle();
    if (idToken) {
      try {
        const { data } = await api.post<{ access_token: string }>(
          "/auth/login/firebase",
          { idToken }
        );
        const jwt = data.access_token;
        localStorage.setItem("token", jwt);
        setToken(jwt);
        await fetchMe(jwt);
      } catch (err) {
        console.error("Erro trocando token Firebase por JWT:", err);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    (async () => {
      try {
        const idToken = await handleRedirectLogin();
        if (idToken) {
          const { data } = await api.post<{ access_token: string }>(
            "/auth/login/firebase",
            { idToken }
          );
          const jwt = data.access_token;
          localStorage.setItem("token", jwt);
          setToken(jwt);
          await fetchMe(jwt);
        } else if (token) {
          await fetchMe(token);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        logout();
      } finally {
        setInitialized(true);
      }
    })();
  }, []);

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