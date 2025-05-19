import React, { useState } from "react";
import { UserGrid } from "@/components/UserGrid";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Users, MessageSquare } from "lucide-react";
import { IconicChat } from "@/components/IconicChat";

const tabList = [
  { key: "chat", icon: <MessageSquare className="w-5 h-5" /> },
  { key: "members", icon: <Users className="w-5 h-5" /> },
];

export default function IconicNetworkPage() {
  const { isIconic } = useAuth();
  const [tab, setTab] = useState<"members" | "chat">("chat");

  if (!isIconic) {
    return (
      <div className="flex flex-col h-full min-h-0 bg-gray-50 text-gray-900">
        <Header />
        <main className="flex-1 min-h-0 flex flex-col items-center justify-center px-6">
          <div className="bg-white/90 rounded-2xl p-6 text-center max-w-md w-full border border-gray-200 shadow-lg">
            <h1 className="text-lg font-bold mb-2 text-gray-900">
              Só para membros ICONIC
            </h1>
            <p className="mb-4 text-gray-600 text-sm">
              Torne-se ICONIC no próximo drop e acesse a comunidade mais
              exclusiva do streetwear.
            </p>
            <button
              className="mt-3 px-6 py-2 rounded-full font-semibold bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 text-white shadow text-sm"
              disabled
            >
              Em breve: novo drop ICONIC
            </button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50 text-gray-900">
      <Header />
      <main className="flex-1 min-h-0 flex flex-col items-center w-full max-w-xl mx-auto px-0 pt-16">
        {/* pt-16 = padding-top: 64px (altura do Header) */}
        <div className="w-full px-4">
          <div className="flex gap-2 mb-3 justify-center">
            {tabList.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as "members" | "chat")}
                className={`
                  flex-1 py-2 rounded-full transition-all outline-none flex items-center justify-center gap-1 text-base
                  ${
                    tab === t.key
                      ? "iconic-gradient text-white shadow-lg scale-105 font-bold"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }
                  focus:ring-2 focus:ring-primary/50
                `}
                style={
                  tab === t.key ? { boxShadow: "0 2px 20px 0 #A855F733" } : {}
                }
              >
                {t.icon}
              </button>
            ))}
          </div>
        </div>
        <div
          className="w-full flex flex-col px-2"
          style={{
            // 100vh - Header(64) - BottomNav(56) - Abas(56)
            height: "calc(100vh - 64px - 56px - 56px)",
            maxHeight: "calc(100vh - 64px - 56px - 56px)",
          }}
        >
          {tab === "chat" ? (
            <IconicChat />
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <h3 className="text-lg font-semibold text-purple-700 text-center mb-1">
                Membros ICONIC
              </h3>
              <p className="text-sm text-gray-400 text-center mb-3">
                Conecte-se com outros membros Streetwear.
              </p>
              <UserGrid endpoint="/iconic/members" compact />
            </div>
          )}
        </div>
      </main>
      <BottomNav />

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
