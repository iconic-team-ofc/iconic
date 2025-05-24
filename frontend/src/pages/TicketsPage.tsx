import React, { useEffect, useState } from "react";
import { EventCard } from "@/components/EventCard";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { api } from "@/lib/api";

const tabList = [
  { key: "events", label: "Recommended Events" },
  { key: "my-tickets", label: "My Tickets" },
];

export default function TicketsPage() {
  const [tab, setTab] = useState<"events" | "my-tickets">("events");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchEvents = async () => {
      try {
        if (tab === "events") {
          const { data } = await api.get("/events/recommended");
          setEvents(data);
        } else {
          const { data } = await api.get("/events/participating");
          setEvents(data);
        }
      } catch (err) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [tab]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 pt-16 pb-16">
      <Header />

      <main className="flex-1 flex flex-col px-4 mt-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabList.map((t) => {
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as "events" | "my-tickets")}
                className={`flex-1 py-2 rounded-full font-semibold transition text-base outline-none
                  ${
                    isActive
                      ? "iconic-gradient text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }
                  focus:ring-2 focus:ring-primary/50
                `}
                style={isActive ? { boxShadow: "0 2px 20px 0 #A855F733" } : {}}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-center text-gray-500 mt-10">Loading…</p>
        ) : events.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            {tab === "events"
              ? "No recommended events at the moment."
              : "You haven't registered for any events yet."}
          </p>
        ) : (
          <div className="space-y-4">
            {events.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />

      {/* Animated gradient CSS (optional, can go in globals.css) */}
      <style>{`
        @keyframes gradient-pan {
          0%,100% {background-position:0% 50%;}
          50%{background-position:100% 50%;}
        }
        .iconic-gradient {
          background: linear-gradient(90deg, #A855F7, #EC4899, #A855F7, #FDE68A);
          background-size: 300% 300%;
          animation: gradient-pan 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
