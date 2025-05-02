// src/pages/Login.tsx
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login();
      navigate("/");
    } catch {
      alert("Erro ao fazer login com Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm bg-[#1A1A1A] rounded-2xl shadow-xl p-6 text-center">
        <h1 className="text-primary text-4xl sm:text-5xl font-extrabold uppercase tracking-wide drop-shadow-md">
          ICONIC
        </h1>
        <div className="mx-auto mt-3 mb-5 h-1 w-12 bg-gold rounded-full animate-pulse" />

        <p className="text-secondary text-base leading-relaxed mb-8">
          Transforme desejos e gostos em <strong>momentos memoráveis</strong>.
          <br />
          <span className="text-text font-semibold">Viva o que é ICÔNICO.</span>
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`
            w-full inline-flex items-center justify-center gap-3
            text-text font-semibold py-3 rounded-full shadow-lg
            focus:outline-none focus:ring-2 focus:ring-gold
            transition 
            ${
              loading
                ? "bg-secondary cursor-not-allowed"
                : "btn-gradient animate-gradient-pan"
            }
          `}
        >
          {!loading && (
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google logo"
              className="w-6 h-6"
            />
          )}
          {loading ? "Entrando..." : "Entrar com Google"}
        </button>

        <p className="text-secondary text-sm mt-6 leading-tight">
          Ao entrar, você desbloqueia selos mensais, conecta-se com marcas,
          pessoas e participa de eventos exclusivos.
        </p>
      </div>
    </div>
  );
}
