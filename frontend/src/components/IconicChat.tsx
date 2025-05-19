import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Send } from "lucide-react";
import { UserProfileModal } from "@/components/UserProfileModal";

type ChatMessage = {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  nickname: string;
  profile_picture_url?: string;
};

export function IconicChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get<ChatMessage[]>("/iconic/chat");
        setMessages(data.reverse());
      } catch {}
      finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    const text = message.trim();
    try {
      await api.post("/iconic/chat", { message: text });
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          user_id: user.id,
          message: text,
          created_at: new Date().toISOString(),
          nickname: user.nickname,
          profile_picture_url: user.profile_picture_url || "",
        },
      ]);
      setMessage("");
    } catch {}
    finally {
      setSending(false);
    }
  };

  const openProfile = async (user_id: string) => {
    try {
      const { data } = await api.get(`/users/public/${user_id}`);
      setSelectedUser(data);
    } catch {}
  };
  const closeModal = () => setSelectedUser(null);

  return (
    <div className="flex flex-col h-full min-h-0 bg-white rounded-xl shadow-inner border overflow-hidden">
      {/* Header do chat */}
      <div className="flex-none px-4 py-2 border-b bg-gray-100">
        <h2 className="text-[11px] font-semibold text-gray-600 text-center tracking-wide uppercase">
          ICONIC CHAT
        </h2>
      </div>
      {/* Área de mensagens */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2 bg-gray-50">
        {loading && (
          <p className="text-gray-400 text-center">Carregando mensagens…</p>
        )}
        {!loading && messages.length === 0 && (
          <p className="text-gray-400 text-center">Seja o primeiro a falar!</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.nickname === user.nickname;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              {!isMe && (
                <img
                  onClick={() => openProfile(msg.user_id)}
                  src={msg.profile_picture_url || "/avatar_placeholder.png"}
                  alt={msg.nickname}
                  className="w-8 h-8 rounded-full border border-gray-200 mr-2 cursor-pointer"
                />
              )}
              <div className="max-w-[80vw]">
                {!isMe && (
                  <span className="text-xs text-gray-500 block mb-0.5">
                    @{msg.nickname}
                  </span>
                )}
                <div
                  className={`px-3 py-1.5 rounded-xl text-sm leading-tight ${
                    isMe
                      ? "bg-purple-500 text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                  style={{ wordBreak: "break-word" }}
                >
                  {msg.message}
                </div>
                <span
                  className={`text-2xs text-gray-400 block ${
                    isMe ? "text-right" : ""
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {isMe && (
                <img
                  onClick={() => openProfile(msg.user_id)}
                  src={msg.profile_picture_url || "/avatar_placeholder.png"}
                  alt={msg.nickname}
                  className="w-8 h-8 rounded-full border border-gray-200 ml-2 cursor-pointer"
                />
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex-none flex items-center px-3 py-2 border-t bg-white"
      >
        <input
          type="text"
          className="flex-1 bg-gray-100 px-3 py-2 rounded-full text-sm outline-none"
          placeholder="Digite uma mensagem…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sending}
          maxLength={240}
        />
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="ml-2 p-2 bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-400 text-white rounded-full disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
      {selectedUser && (
        <UserProfileModal isOpen onClose={closeModal} user={selectedUser} />
      )}
    </div>
  );
}
  