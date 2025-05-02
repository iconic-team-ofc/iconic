import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Route, Routes, BrowserRouter } from "react-router-dom";
import Login from "@/pages/Login";
import Home from "@/pages/Home";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);
