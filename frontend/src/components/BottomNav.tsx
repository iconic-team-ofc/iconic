// src/components/BottomNav.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Sparkles, Ticket, User } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/iconic-network", icon: Sparkles, label: "Rede" },
  { to: "/tickets", icon: Ticket, label: "Ingressos" },
  { to: "/profile", icon: User, label: "Perfil" },
];

export function BottomNav() {
  return (
    <>
      {/* Gradiente para ícones e texto ativos */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="iconicGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
      </svg>

      <nav className="fixed bottom-0 z-50 w-full bg-white border-t border-gray-200 flex justify-around py-2 sm:hidden">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className="flex flex-col items-center justify-center px-2"
          >
            {({ isActive }) => (
              <>
                {/* Ícone */}
                <Icon
                  stroke={isActive ? "url(#iconicGradient)" : "currentColor"}
                  className={`w-5 h-5 mb-1 ${
                    isActive ? "" : "text-gray-500 hover:text-gray-700"
                  }`}
                />
                {/* Texto */}
                <span
                  className={`text-xs ${
                    isActive
                      ? "text-transparent bg-clip-text bg-gradient-to-br from-purple-500 via-pink-500 to-purple-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
