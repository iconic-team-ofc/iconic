// src/pages/EventDetail.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Calendar, Clock, MapPin, QrCode, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { UserGrid } from "@/components/UserGrid";
import placeholderEvent from "@/assets/placeholder_event.png";

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
  is_participating: boolean;
  participation_id?: string;
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  // Fetch event details
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await api.get<EventDetail>(`/events/${id}`);
        setEvent(data);
      } catch (err) {
        console.warn("Erro ao carregar detalhes:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Check if user is checked in
  useEffect(() => {
    if (!event) return;
    (async () => {
      try {
        const { data } = await api.get<{ checkedIn: boolean }>(
          `/event-checkins/event/${id}/user/${user.id}/checked`
        );
        setCheckedIn(data.checkedIn);
      } catch (err) {
        console.warn("Erro ao verificar autenticação:", err);
      }
    })();
  }, [event, id, user.id]);

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
    } catch (err: any) {
      if (err.response?.status === 409)
        alert("Você já está inscrito neste evento.");
      else alert("Erro ao confirmar presença. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  // Cancel button removed once checked in
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
      setCheckedIn(false);
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

  // Format date/time strings
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
  const role = user?.role.toLowerCase() ?? "";
  const canScan = role === "admin" || role === "scanner";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <div className="flex-1 overflow-auto pb-24">
        <div className="relative">
          {/* Event Banner with fallback */}
          <img
            src={event.cover_image_url}
            onError={(e) => (e.currentTarget.src = placeholderEvent)}
            className="w-full h-64 object-cover"
            alt={event.title}
          />
          {/* Small flag-style badge */}
          {checkedIn && (
            <div className="absolute top-3 left-3 bg-white bg-opacity-80 text-gray-900 px-2 py-1 text-xs font-medium uppercase rounded">
              {event.is_exclusive ? "ICONIC Liberado" : "Acesso Liberado"}
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          <h1 className="text-2xl font-extrabold text-primary">
            {event.title}
          </h1>
          {/* Subtle confirmation message */}
          {checkedIn && (
            <div className="text-center text-sm text-gray-600 italic">
              {event.is_exclusive
                ? "Parabéns, seu acesso ICONIC está garantido. Hora de brilhar!"
                : "Parabéns, seu acesso está garantido. Aproveite!"}
            </div>
          )}

          {/* Partner info */}
          {event.partner_logo_url && (
            <div className="flex items-center space-x-2">
              <img
                src={event.partner_logo_url}
                onError={(e) => (e.currentTarget.src = placeholderEvent)}
                className="w-8 h-8 rounded-full"
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

          {/* Action buttons */}
          <div className="flex flex-col gap-3 mt-6">
            {!event.is_participating ? (
              <button
                onClick={handleJoin}
                disabled={processing}
                className="w-full bg-primary hover:bg-hover text-white font-semibold py-3 rounded-full transition disabled:opacity-50"
              >
                {processing ? "Confirmando..." : "Confirmar presença"}
              </button>
            ) : !checkedIn ? (
              <>
                <button
                  onClick={() => navigate(`/events/${event.id}/checkin`)}
                  className="w-full flex items-center justify-center bg-primary text-white font-semibold py-3 rounded-full transition"
                >
                  <QrCode className="w-5 h-5 mr-2" /> QR de Acesso
                </button>
                {canScan && (
                  <button
                    onClick={() => navigate(`/events/${event.id}/scan`)}
                    className="w-full flex items-center justify-center bg-white border-2 border-primary text-primary font-semibold py-3 rounded-full transition hover:bg-primary/10"
                  >
                    <Camera className="w-5 h-5 mr-2" /> Modo Scanner
                  </button>
                )}
                {/* Cancel hidden until after checkin lives out */}
                <button
                  onClick={handleCancel}
                  disabled={processing}
                  className="w-full text-center text-sm text-gray-500 underline disabled:opacity-50"
                >
                  {processing ? "Cancelando..." : "Cancelar inscrição"}
                </button>
              </>
            ) : null}
          </div>

          {/* Participants Grid */}
          {event.is_participating && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Confirmados no evento
              </h2>
              <UserGrid
                endpoint={`/event-participations/event/${event.id}/confirmed-users`}
              />
            </section>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
