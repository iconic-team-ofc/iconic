import React from "react";
import { Calendar, Clock, MapPin, Ticket, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import DefaultCover from "@/assets/placeholder_event.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Event } from "@/contexts/EventsContext";

interface EventCardProps {
  event: Event;
  onIconicClick: (evt: Event) => void;
  canAccess: boolean;
}

export function EventCard({ event, onIconicClick, canAccess }: EventCardProps) {
  const remaining = event.max_attendees - event.current_attendees;
  const isSoldOut = remaining <= 0;
  const isMember = event.is_participating;

  const isExclusive = event.is_exclusive;
  const isPublic = event.is_public;
  const isPremiumClosed = isExclusive && !isPublic;
  const isExclusiveOpen = isExclusive && isPublic;

  const showLock = isExclusiveOpen && !canAccess;

  const bgClass = isPremiumClosed
    ? "bg-gradient-to-br from-yellow-700 via-yellow-500 to-yellow-300 animate-gradient-pan shadow-lg"
    : isExclusiveOpen
    ? "bg-gradient-to-br from-purple-500 via-pink-500 to-purple-500 animate-gradient-pan shadow-lg"
    : "bg-white shadow-lg";

  const textClass = isPremiumClosed || isExclusiveOpen ? "text-white" : "text-gray-800";
  const descClass = isPremiumClosed || isExclusiveOpen ? "text-white/90" : "text-gray-600";
  const infoTextClass = isPremiumClosed || isExclusiveOpen ? "text-white/70" : "text-gray-500";

  const soldOutBtn = "bg-gray-200 text-gray-400 cursor-not-allowed";
  const lockedBtn = "bg-white/20 text-white hover:bg-white/30 flex items-center justify-center gap-1";
  const standardBtn = "bg-primary text-white hover:bg-hover";
  const premiumBtn = "bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 text-white hover:from-yellow-500 hover:via-yellow-400 hover:to-yellow-300";

  let participateBtnClass = soldOutBtn;
  if (!isSoldOut) {
    if (!canAccess) participateBtnClass = lockedBtn;
    else if (isPremiumClosed) participateBtnClass = premiumBtn;
    else participateBtnClass = standardBtn;
  }

  const detailBtnClass =
    isPremiumClosed || isExclusiveOpen
      ? "flex-1 py-2 text-sm font-medium rounded-full text-white bg-white/20 hover:bg-white/30 flex items-center justify-center"
      : "flex-1 py-2 text-sm font-medium rounded-full text-gray-800 border border-gray-300 hover:bg-gray-100 flex items-center justify-center";

  const handleParticipation = () => {
    if (!canAccess) {
      const msg = isPremiumClosed
        ? "Evento premium fechado: exclusivo para membros ICONIC."
        : "Passe ICONIC necessário para participar deste evento.";
      toast.error(msg, { position: "top-center", autoClose: 4000 });
      return;
    }
    // Chame a função de participação definida no contexto
    // useEvents().participate(event.id)
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
    <>
      <div className={`w-full ${bgClass} rounded-xl overflow-hidden`}>
        <div className="relative">
          <img
            className="w-full h-44 object-cover"
            src={event.cover_image_url || DefaultCover}
            alt={event.title}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DefaultCover;
            }}
          />
          {isMember && (
            <span className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">
              Inscrito
            </span>
          )}
          {!isMember && isSoldOut && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
              Esgotado
            </span>
          )}
        </div>

        <div className="p-4 space-y-2">
          <h3 className={`text-lg font-semibold ${textClass}`}>{event.title}</h3>
          <p className={`${descClass} text-sm line-clamp-2`}>{event.description}</p>

          {(isPremiumClosed || isExclusiveOpen) && (
            <p className="text-xs italic font-medium text-white/80">
              {isPremiumClosed
                ? "Evento premium fechado: exclusivo ICONIC"
                : "Evento exclusivo ICONIC"}
            </p>
          )}

          <div className={`flex flex-wrap gap-2 ${infoTextClass} text-xs`}>
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

          {!isMember && !isSoldOut && (
            <div className={`${infoTextClass} text-xs mt-1`}>
              <div className="flex items-center gap-1">
                <Ticket className="w-4 h-4" /> {remaining} vagas restantes
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            {isMember ? (
              <>
                <button
                  disabled
                  className="flex-1 py-2 text-sm font-semibold rounded-full bg-gray-300 text-gray-500 cursor-not-allowed"
                >
                  Inscrito
                </button>
                <Link to={`/events/${event.id}`} className={detailBtnClass}>
                  Ver Detalhes
                </Link>
              </>
            ) : (
              <>
                {!isSoldOut && (
                  <button
                    onClick={() =>
                      canAccess
                        ? handleParticipation()
                        : onIconicClick(event)
                    }
                    className={`flex-1 py-2 text-sm font-semibold rounded-full transition ${participateBtnClass}`}
                  >
                    {showLock && <Lock className="w-4 h-4 mr-1" />}
                    {canAccess ? "Participar" : "Somente ICONIC"}
                  </button>
                )}
                <Link to={`/events/${event.id}`} className={detailBtnClass}>
                  Ver Detalhes
                </Link>
                {isSoldOut && (
                  <span className="flex-1 py-2 text-sm font-semibold rounded-full bg-gray-200 text-gray-400 text-center cursor-not-allowed">
                    Esgotado
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
