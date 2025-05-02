import { createContext, useContext, useEffect, useState } from "react";
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  const fetchMe = async (token: string) => {
    const res = await api.get("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(res.data);
  };

  const login = async () => {
    try {
      const idToken = await loginWithGoogle();
      const res = await api.post("/auth/login/firebase", { idToken });
      const jwt = res.data.access_token;
      localStorage.setItem("token", jwt);
      setToken(jwt);
      await fetchMe(jwt);
    } catch (err) {
      console.error("Erro ao autenticar", err);
      logout();
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (token) fetchMe(token).catch(logout);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
