// src/pages/QRCodeScreen.tsx

import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import placeholderEvent from "@/assets/placeholder_event.png";

export default function QRCodeScreen() {
  const { user } = useAuth();
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [qrUrl, setQrUrl] = useState<string>("");
  const [progress, setProgress] = useState(100);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loadingQr, setLoadingQr] = useState(true);

  const timerRef = useRef<NodeJS.Timeout>();
  const pollRef = useRef<NodeJS.Timeout>();

  const fetchQr = async () => {
    try {
      const { data } = await api.post<{ qr_code_url: string }>(
        "/event-checkins/generate",
        { event_id: eventId }
      );
      setQrUrl(data.qr_code_url);
      setProgress(100);
    } catch (err) {
      console.error("Erro ao gerar QR:", err);
    } finally {
      setLoadingQr(false);
    }
  };

  // Poll server to detect when checked in
  const pollCheckedIn = async () => {
    try {
      const { data } = await api.get<{ checkedIn: boolean }>(
        `/event-checkins/event/${eventId}/user/${user!.id}/checked`
      );
      if (data.checkedIn) {
        setCheckedIn(true);
        clearInterval(timerRef.current!);
        clearInterval(pollRef.current!);
      }
    } catch (err) {
      console.warn("Erro ao verificar check-in:", err);
    }
  };

  useEffect(() => {
    fetchQr();

    // QR refresh timer
    let start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - start) / 600; // 60s→100%
      const next = Math.max(0, 100 - elapsed);
      setProgress(next);
      if (next <= 0) {
        fetchQr();
        start = Date.now();
      }
    }, 1000);

    // Poll check-in every 3 seconds
    pollRef.current = setInterval(pollCheckedIn, 3000);

    return () => {
      clearInterval(timerRef.current!);
      clearInterval(pollRef.current!);
    };
  }, []);

  // Luxury messages
  const successMessage =
    eventId && checkedIn
      ? user?.role === "iconic" || eventId.includes("iconic")
        ? "Brilhante! Seu acesso ICONIC foi autenticado."
        : "Ótimo! Seu check‑in foi confirmado."
      : "";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 pt-16 pb-16">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {!checkedIn ? (
          <>
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="QR Code de acesso"
                className="w-48 h-48 mb-6 shadow-lg"
                onError={(e) => (e.currentTarget.src = placeholderEvent)}
              />
            ) : loadingQr ? (
              <p className="text-gray-500">Gerando seu QR…</p>
            ) : null}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              QR ativo por <strong>{Math.ceil((progress / 100) * 60)}s</strong>
            </p>
            <p className="mt-4 text-center text-gray-500 text-sm">
              Apresente este QR ao scanner para liberar seu acesso.
            </p>
          </>
        ) : (
          <div className="text-center space-y-4 px-4">
            <p className="text-xl font-semibold text-primary">
              {successMessage}
            </p>
            <button
              onClick={() => navigate(`/events/${eventId}`)}
              className="mt-2 px-6 py-3 bg-primary text-white font-semibold rounded-full"
            >
              Voltar ao Evento
            </button>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
