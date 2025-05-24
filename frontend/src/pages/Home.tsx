// src/pages/Home.tsx
import React, { useState } from "react";
import { useEvents, EventsProvider, Event } from "@/contexts/EventsContext";
import { EventCard } from "@/components/EventCard";
import { BecomeIconicCard } from "@/components/BecomeIconicCard";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@suiet/wallet-kit";
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
  const { events, loading, error, participate } = useEvents();
  const { user, isIconic, token } = useAuth();
  const { connected, connect } = useWallet();
  const { payFee } = usePaywall();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [waiting, setWaiting] = useState(false);

  // Se evento exclusivo e user não ICONIC → abre modal
  const handleIconicClick = (evt: Event) => {
    setSelectedEvent(evt);
  };

  // Só dispara participate; toasts de sucesso/falha ficam no EventCard
  const handleJoin = async (evt: Event) => {
    await participate(evt.id);
  };

  // Fluxo de Become ICONIC (mantém toasts no modal)
  const handleSubscribe = async () => {
    if (!connected) {
      await connect();
      return;
    }
    setWaiting(true);
    try {
      const txId = await payFee(0.1);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/iconic/${user!.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Transaction-Id": txId,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );
      if (res.ok) {
        window.location.reload();
      }
    } catch {
      // trata erro no modal
    } finally {
      setWaiting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 pt-16 pb-16">
      <Header />
      <main className="flex-1 overflow-auto px-4 py-6 md:px-12 md:py-10 lg:px-16 lg:py-12 max-w-7xl mx-auto">
        <h2 className="text-xl md:text-3xl font-semibold text-gray-700 mb-3">
          Live Memorable Experiences
        </h2>
        <p className="text-base md:text-lg text-gray-500 mb-8">
          Discover premium events, curated for your urban lifestyle.
        </p>

        {loading && <p className="text-center text-gray-500 mt-10">Loading…</p>}
        {error && <p className="text-center text-red-500 mt-10">{error}</p>}
        {!loading && !error && events.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            New experiences coming soon.
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {events.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              canAccess={isIconic || !evt.is_exclusive}
              onIconicClick={handleIconicClick}
              onJoin={handleJoin}
            />
          ))}
        </div>
      </main>

      {selectedEvent && (
        <Modal open onClose={() => setSelectedEvent(null)}>
          <BecomeIconicCard
            connected={connected}
            connect={connect}
            waiting={waiting}
            onSubscribe={handleSubscribe}
            feeAmount={0.1}
            networkName="Sui Testnet"
          />
        </Modal>
      )}

      <BottomNav />
    </div>
  );
}
