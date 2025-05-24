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
  const { payFee } = usePaywall();

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

      // Pay a small amount, like 0.1 SUI, to ensure the transaction doesn't spend all the balance
      const txId = await payFee(0.1);
      console.log("txId:", txId);

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
        alert("Congratulations! You are now ICONIC.");
        window.location.reload();
      } else if (res.status === 403) {
        alert("Promotion pending: please wait for confirmation and reload.");
      } else {
        throw new Error("Unexpected error: " + res.status);
      }
    } catch (err: any) {
      // LOG + animated alert
      console.error("Error during payment or backend request:", err);
      alert(
        err.message ||
          JSON.stringify(err) ||
          "Unknown failure during subscription."
      );
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
          Live Memorable Experiences
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Discover premium events, curated for your urban lifestyle.
        </p>

        {loading && <p className="text-center text-gray-500 mt-10">Loading…</p>}
        {error && <p className="text-center text-red-500 mt-10">{error}</p>}
        {!loading && !error && events.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            New experiences coming soon.
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
          <div
            className="p-0 rounded-2xl bg-gradient-to-br from-[#FF8CAB] via-[#FF72D3] to-[#6A4CFF] animate-gradient-pan"
            style={{
              boxShadow: "0 8px 40px 0 rgba(106, 76, 255, 0.20)",
            }}
          >
            <div className="rounded-2xl bg-white/95 p-7 flex flex-col items-center gap-3 relative">
              <h3 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#FF8CAB] via-[#FF72D3] to-[#6A4CFF] tracking-tight uppercase mb-1">
                Become ICONIC
              </h3>
              <span className="text-base font-medium text-gray-700 tracking-wide text-center">
                Unlock exclusive experiences and enter the ICONIC circle.
              </span>
              <ul className="text-gray-600 text-sm my-2 text-left list-disc pl-4 space-y-1">
                <li>Access premium, members-only events.</li>
                <li>Showcase your ICONIC badge across the platform.</li>
                <li>Priority entry, VIP opportunities, and more.</li>
              </ul>
              <div className="my-2 w-full text-center">
                <div className="inline-block bg-gradient-to-r from-[#FF8CAB] via-[#FF72D3] to-[#6A4CFF] px-4 py-2 rounded-full text-white font-semibold text-base shadow animate-pulse">
                  Only <span className="font-extrabold">0.1 SUI</span> on Sui
                  Testnet
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">
                <span className="font-bold text-[#6A4CFF]">
                  Ultra-fast payment
                </span>{" "}
                powered by <span className="font-bold">Sui Blockchain</span>.
                Just approve in your wallet and you’re in!
              </p>
              <div className="flex flex-col w-full mt-6 gap-3">
                {!connected ? (
                  <ConnectButton className="w-full py-2 bg-gray-800 text-white rounded-lg text-lg font-bold" />
                ) : (
                  <button
                    onClick={handleSubscribe}
                    disabled={waiting}
                    className={`w-full py-3 rounded-xl font-bold text-lg shadow transition-all
              ${
                waiting
                  ? "bg-gray-400 cursor-wait"
                  : "bg-gradient-to-r from-[#FF8CAB] via-[#FF72D3] to-[#6A4CFF] text-white hover:brightness-105 animate-gradient-pan"
              }`}
                  >
                    {waiting ? "Processing…" : "Become ICONIC Now"}
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-400 text-center mt-3">
                Payments on <span className="font-medium">Sui Testnet</span>. No
                real funds required.
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
