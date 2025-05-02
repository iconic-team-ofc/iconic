import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { loginWithGoogle } from "@/firebase";
import { api } from "@/lib/api";

type User = {
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
    if (!idToken) throw new Error("Falha ao autenticar no Google");
    const res = await api.post<{ access_token: string }>(
      "/auth/login/firebase",
      { idToken }
    );
    const jwt = res.data.access_token;
    localStorage.setItem("token", jwt);
    setToken(jwt);
    await fetchMe(jwt);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    (async () => {
      if (token) {
        try {
          await fetchMe(token);
        } catch {
          logout();
        }
      }
      setInitialized(true);
    })();
  }, []);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-700">Carregando...</p>
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
