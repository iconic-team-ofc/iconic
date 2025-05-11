// src/router/routes.tsx
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import EventDetail from "@/pages/EventDetail";
import QRCodeScreen from "@/pages/QRCodeScreen";
import ScannerScreen from "@/pages/ScannerScreen";
import Profile from "@/pages/Profile";
import { useAuth } from "@/contexts/AuthContext";
import { AnalyticsObserver } from "@/components/AnalyticsObserver";  
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AnalyticsObserver />

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

        <Route
          path="/events/:id"
          element={
            <PrivateRoute>
              <EventDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/events/:id/checkin"
          element={
            <PrivateRoute>
              <QRCodeScreen />
            </PrivateRoute>
          }
        />

        <Route
          path="/events/:id/scan"
          element={
            <PrivateRoute>
              <ScannerScreen />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
