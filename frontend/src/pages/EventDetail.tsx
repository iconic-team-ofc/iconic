import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

interface User {
  id: string;
  full_name: string;
  nickname: string;
  profile_picture_url: string | null;
}

interface EventDetail {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  is_exclusive: boolean;
  cover_image_url: string;
  partner_name?: string;
  partner_logo_url?: string;
  max_attendees: number;
  current_attendees: number;

  // Flags vindas do novo endpoint
  is_participating: boolean;
  participation_id?: string;
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        // agora o GET /events/:id já retorna is_participating + participation_id
        const { data: evt } = await api.get<EventDetail>(`/events/${id}`);
        setEvent(evt);

        if (evt.is_participating) {
          const { data: confirmed } = await api.get<User[]>(
            `/event-participations/event/${id}/confirmed-users`
          );
          setUsers(confirmed);
        }
      } catch (err) {
        console.warn("Erro ao carregar detalhes:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  const handleJoin = async () => {
    if (!event || processing) return;
    setProcessing(true);
    try {
      const { data } = await api.post<{ id: string }>(`/event-participations`, {
        event_id: event.id,
        status: "confirmed",
      });
      setEvent((e) =>
        e
          ? {
              ...e,
              is_participating: true,
              participation_id: data.id,
              current_attendees: e.current_attendees + 1,
            }
          : e
      );
      const { data: confirmed } = await api.get<User[]>(
        `/event-participations/event/${event.id}/confirmed-users`
      );
      setUsers(confirmed);
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert("Você já está inscrito neste evento.");
      } else {
        alert("Erro ao confirmar presença. Tente novamente.");
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!event?.participation_id || processing) return;
    setProcessing(true);
    try {
      await api.patch(`/event-participations/${event.participation_id}`, {
        status: "cancelled",
      });
      setEvent((e) =>
        e
          ? {
              ...e,
              is_participating: false,
              participation_id: undefined,
              current_attendees: e.current_attendees - 1,
            }
          : e
      );
      setUsers([]);
    } catch {
      alert("Erro ao cancelar presença. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Carregando evento…</p>
      </div>
    );
  }

  const dt = new Date(event.date);
  const dateStr = dt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = dt.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <div className="flex-1 overflow-auto">
        <img
          src={event.cover_image_url}
          onError={(e) => (e.currentTarget.src = "/placeholder_event.png")}
          className="w-full h-56 object-cover"
          alt={event.title}
        />

        <div className="p-4 space-y-4">
          <h1 className="text-2xl font-extrabold text-primary">
            {event.title}
          </h1>

          {event.partner_logo_url && (
            <div className="flex items-center space-x-2">
              <img
                src={event.partner_logo_url}
                onError={(e) => (e.currentTarget.style.display = "none")}
                className="w-6 h-6 rounded-full"
                alt={event.partner_name}
              />
              <span className="text-sm text-gray-600">
                Parceiro: {event.partner_name}
              </span>
            </div>
          )}

          <p className="text-gray-700">{event.description}</p>

          <div className="flex flex-wrap gap-4 text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-5 h-5" /> {dateStr}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-5 h-5" /> {timeStr}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-5 h-5" /> {event.location}
            </span>
          </div>

          <div className="flex gap-3 mt-4">
            {!event.is_participating ? (
              <button
                onClick={handleJoin}
                disabled={processing}
                className="flex-1 bg-primary hover:bg-hover text-white font-semibold py-2 rounded-full transition disabled:opacity-50"
              >
                {processing ? "Confirmando..." : "Confirmar presença"}
              </button>
            ) : (
              <button
                onClick={handleCancel}
                disabled={processing}
                className="flex-1 border border-primary text-primary font-semibold py-2 rounded-full transition hover:bg-primary/10 disabled:opacity-50"
              >
                {processing ? "Cancelando..." : "Cancelar inscrição"}
              </button>
            )}
          </div>

          <section className="mt-6">
            {event.is_participating ? (
              <>
                <h2 className="font-semibold mb-2 text-gray-800">
                  Confirmados no evento
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {users.map((u) => (
                    <img
                      key={u.id}
                      src={u.profile_picture_url || "/avatar_placeholder.png"}
                      alt={u.nickname}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-600 mt-4">
                Veja quem já garantiu seu lugar –{" "}
                <strong>confirme sua presença</strong> para entrar na comunidade
                ICONIC!
              </p>
            )}
          </section>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
