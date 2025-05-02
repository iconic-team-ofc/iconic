// src/pages/Login.tsx

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
<<<<<<< Updated upstream
=======
import GoogleLogo from "@/assets/icons8-google-logo-96.svg";
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm bg-[#1A1A1A] rounded-2xl shadow-xl p-6 text-center">
        <h1 className="text-primary text-4xl sm:text-5xl font-extrabold uppercase tracking-wide drop-shadow-md">
          ICONIC
        </h1>
        <div className="mx-auto mt-3 mb-5 h-1 w-12 bg-gold rounded-full animate-pulse" />
=======
    <div className="min-h-screen flex flex-col justify-evenly items-center bg-gray-50 px-6">
      {/* Título com gradiente animado */}
      <h1
        className="
          text-5xl sm:text-6xl font-extrabold uppercase text-transparent bg-clip-text
          bg-gradient-to-r from-primary via-hover to-pink-500
          animate-gradient-pan text-center
        "
      >
        ICONIC
      </h1>
>>>>>>> Stashed changes

      {/* Slogan */}
      <p className="text-gray-700 text-center max-w-md leading-relaxed">
        Transforme desejos e gostos em <strong>momentos memoráveis</strong>.
        <br />
        <span className="font-semibold">Viva o que é ICÔNICO.</span>
      </p>

<<<<<<< Updated upstream
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
=======
      {/* Botão de login Google */}
      <button
        onClick={handleLogin}
        disabled={loading}
        className={`
          w-full max-w-xs flex items-center justify-center gap-3
          ${
            loading
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-white hover:bg-gray-100"
          }
          border border-gray-300 text-gray-800 font-medium
          py-3 rounded-full shadow-sm
          focus:outline-none focus:ring-2 focus:ring-primary
          transition-colors duration-200
        `}
      >
        {!loading && (
          <img src={GoogleLogo} alt="Google logo" className="w-5 h-5" />
        )}
        {loading ? "Entrando..." : "Entrar com Google"}
      </button>
>>>>>>> Stashed changes
    </div>
  );
}
