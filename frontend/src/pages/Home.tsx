// src/pages/Home.tsx
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents, EventsProvider } from "@/contexts/EventsContext";
import { EventCard } from "@/components/EventCard";
import {
  Home as HomeIcon,
  Users as UsersIcon,
  User as UserIcon,
} from "lucide-react";

function HomeContent() {
  const { logout } = useAuth();
  const { events, loading, error } = useEvents();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Cabeçalho */}
      <header className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        {/* Título com gradiente animado */}
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-hover to-pink-500 animate-gradient-pan">
          ICONIC
        </h1>
        <button onClick={logout}>
          <UserIcon className="w-6 h-6 text-gray-500 hover:text-gray-900 transition" />
        </button>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto p-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Eventos Recomendados
        </h2>

        {loading && (
          <p className="text-center text-gray-500 mt-10">
            Carregando eventos...
          </p>
        )}

        {error && <p className="text-center text-red-500 mt-10">{error}</p>}

        {!loading && !error && events.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            Nenhum evento disponível.
          </p>
        )}

        <div className="space-y-4">
          {events.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      </main>

      {/* Navegação Inferior */}
      <nav className="border-t border-gray-200 py-3 px-6 flex justify-around bg-gray-50">
        <HomeIcon className="w-6 h-6 text-gray-500 hover:text-gray-900 transition" />
        <UsersIcon className="w-6 h-6 text-gray-500 hover:text-gray-900 transition" />
        <UserIcon className="w-6 h-6 text-gray-500 hover:text-gray-900 transition" />
      </nav>
    </div>
  );
}

export default function Home() {
  return (
    <EventsProvider>
      <HomeContent />
    </EventsProvider>
  );
}