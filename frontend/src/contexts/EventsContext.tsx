import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Event } from "@/components/EventCard";

interface EventsContextProps {
  events: Event[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  participate: (eventId: string) => Promise<void>;
}

const EventsContext = createContext<EventsContextProps>({
  events: [],
  loading: false,
  error: null,
  refresh: async () => {},
  participate: async () => {},
});

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Async function refresh must be declared async
  const refresh = async (): Promise<void> => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get<Event[]>("/events/recommended");
      const data = Array.isArray(res.data) ? res.data : [];
      setEvents(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar eventos recomendados");
    } finally {
      setLoading(false);
    }
  };

  const participate = async (eventId: string): Promise<void> => {
    try {
      await api.post("/event-participations", { event_id: eventId });
      await refresh();
    } catch (err: any) {
      console.error("Erro ao participar:", err);
      throw err;
    }
  };

  useEffect(() => {
    refresh();
  }, [token]);

  return (
    <EventsContext.Provider
      value={{ events, loading, error, refresh, participate }}
    >
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => useContext(EventsContext);