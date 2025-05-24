// src/pages/Home.tsx
import React, { useState } from "react";
import { useEvents, EventsProvider, Event } from "@/contexts/EventsContext";
import { EventCard } from "@/components/EventCard";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet, ConnectButton } from "@suiet/wallet-kit";
import { usePaywall } from "@/lib/sui";
import Modal from "@/components/modal";

export default function Home() {
  return (
    <EventsProvider>
      <HomeContent />
    </EventsProvider>
  );
}

function HomeContent() {
  const { events, loading, error } = useEvents();
  const { user, isIconic, token } = useAuth();
  const { connected, connect } = useWallet();
  const { payFee } = usePaywall(); // removido waitForConfirmation

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [waiting, setWaiting] = useState(false);

  const handleIconicClick = (evt: Event) => {
    setSelectedEvent(evt);
    setModalOpen(true);
  };

  async function handleSubscribe() {
    try {
      if (!connected) {
        await connect();
        return;
      }
      setWaiting(true);

      const txId = await payFee(1);
      console.log('txId:', txId);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/iconic/${user!.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Transaction-Id': txId,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );

      if (res.ok) {
        alert('Você agora é ICONIC!');
        window.location.reload();
      } else if (res.status === 403) {
        alert('Promovido pendente: aguarde confirmação e recarregue.');
      } else {
        throw new Error('Erro inesperado: ' + res.status);
      }
    } catch (err: any) {
      console.error('Erro durante a assinatura ou chamada ao backend:', err);
      alert(err.message || 'Falha desconhecida durante a assinatura.');
    } finally {
      setWaiting(false);
      setModalOpen(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 pt-16 pb-16">
      <Header />
      <main className="flex-1 overflow-auto px-4 mt-4">
        <h2 className="text-lg font-medium text-gray-700 mb-1">
          Viva experiências memoráveis
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Descubra eventos premium, selecionados para o seu estilo urbano.
        </p>

        {loading && (
          <p className="text-center text-gray-500 mt-10">Carregando…</p>
        )}
        {error && <p className="text-center text-red-500 mt-10">{error}</p>}
        {!loading && !error && events.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            Em breve novas experiências disponíveis.
          </p>
        )}

        <div className="space-y-4">
          {events.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              canAccess={isIconic || !evt.is_exclusive}
              onIconicClick={handleIconicClick}
            />
          ))}
        </div>
      </main>
      <BottomNav />

      {selectedEvent && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <h3 className="text-xl font-semibold mb-4">Tornar-se ICONIC</h3>
          <p className="mb-6">
            Para acessar “{selectedEvent.title}”, é necessário ser membro ICONIC.
          </p>
          <div className="flex flex-col gap-3">
            {!connected ? (
              <ConnectButton className="w-full py-2 bg-gray-800 text-white rounded-lg" />
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={waiting}
                className={`w-full py-2 rounded-lg text-white ${
                  waiting ? "bg-gray-400" : "bg-primary"
                }`}
              >
                {waiting ? "Processando…" : "Assinar ICONIC por 1 SUI"}
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
