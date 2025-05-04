<<<<<<< Updated upstream
=======
// src/pages/Home.tsx
import React from "react";
import { useEvents, EventsProvider } from "@/contexts/EventsContext";
import { EventCard } from "@/components/EventCard";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

function HomeContent() {
  const { events, loading, error } = useEvents();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 pt-16 pb-16">
      {/* Cabeçalho */}
      <Header />

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto px-4 mt-4">
        {/* Headline discreta inspirada na proposta “Viver o que é ICÔNICO” */}
        <h2 className="text-lg font-medium text-gray-700 mb-1">
          Viva experiências memoráveis
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Descubra eventos premium, selecionados para o seu estilo urbano.
        </p>

        {loading && (
          <p className="text-center text-gray-500 mt-10">
            Carregando suas experiências…
          </p>
        )}

        {error && <p className="text-center text-red-500 mt-10">{error}</p>}

        {!loading && !error && events.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            Em breve novas experiências disponíveis. Fique de olho!
          </p>
        )}

        <div className="space-y-4">
          {events.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      </main>

      {/* Navegação Inferior */}
      <BottomNav />
    </div>
  );
}

>>>>>>> Stashed changes
export default function Home() {
    return (
      <div className="text-white p-4">
        <h1 className="text-2xl font-bold">Bem-vindo à ICONIC!</h1>
      </div>
    );
  }
  