import React from "react";
import { useEvents } from "@/contexts/EventsContext";
import type { Event } from "@/components/EventCard";

export const EventCard = ({ event }: { event: Event }) => {
  const { participate } = useEvents();
  const handleClick = (): void => {
    participate(event.id).catch(() => alert("Erro ao participar"));
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <img
        src={event.cover_image_url}
        alt={event.title}
        className="w-full h-40 object-cover rounded-md mb-3"
      />
      <h3 className="text-xl font-semibold text-gray-800 mb-1">
        {event.title}
      </h3>
      <p className="text-gray-600 text-sm mb-2">
        {new Date(event.date).toLocaleDateString()} • {event.time}
      </p>
      <p className="text-gray-700 mb-4">{event.location}</p>
      {event.is_exclusive && (
        <span className="inline-block text-xs text-white bg-primary px-2 py-1 rounded mr-2">
          Exclusivo
        </span>
      )}
      <button
        onClick={handleClick}
        className="mt-4 bg-primary hover:bg-hover text-white font-semibold py-2 px-4 rounded-full transition"
      >
        Participar
      </button>
    </div>
  );
};