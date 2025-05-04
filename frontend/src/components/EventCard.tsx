import React from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useEvents, Event } from "@/contexts/EventsContext";

import DefaultCover from "@/assets/placeholder_event.png";

export function EventCard({ event }: { event: Event }) {
  const { participate, cancelParticipation } = useEvents();

  const remaining = event.max_attendees - event.current_attendees;
  const isSoldOut = remaining <= 0;
  const isMember = event.is_participating;

  const handleParticipation = () => {
    if (isMember && event.participation_id) {
      cancelParticipation(event.participation_id, event.id).catch(() =>
        alert("Erro ao cancelar inscrição")
      );
    } else {
      participate(event.id).catch(() => alert("Erro ao participar"));
    }
  };

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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
      {/* Capa e badges */}
      <div className="relative">
        <img
          className="w-full h-44 object-cover"
          src={event.cover_image_url}
          alt={event.title}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = DefaultCover;
          }}
        />
        {isMember && !isSoldOut && (
          <span className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">
            Inscrito
          </span>
        )}
        {isSoldOut && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
            Esgotado
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2">
          {event.description}
        </p>

        <div className="flex flex-wrap gap-3 text-gray-500 text-xs">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" /> {dateStr}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> {timeStr}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" /> {event.location}
          </span>
        </div>

        {!event.is_exclusive && !isSoldOut && (
          <div className="flex items-center gap-1 text-gray-700 text-xs">
            <Users className="w-4 h-4" />
            <span>{remaining} vagas restantes</span>
          </div>
        )}

        {/* Ações */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleParticipation}
            disabled={isSoldOut}
            className={`
              flex-1 py-2 text-sm font-semibold rounded-full transition
              ${
                isSoldOut
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : isMember
                  ? "bg-secondary text-white hover:bg-secondary/90"
                  : "bg-primary text-white hover:bg-hover"
              }
            `}
          >
            {isSoldOut ? "Esgotado" : isMember ? "Cancelar" : "Participar"}
          </button>
          <Link
            to={`/events/${event.id}`}
            className="
              flex-1 py-2 text-sm font-medium rounded-full text-gray-800
              border border-gray-300 text-center hover:bg-gray-100 transition
            "
          >
            Ver Detalhes
          </Link>
        </div>
      </div>
    </div>
  );
}
