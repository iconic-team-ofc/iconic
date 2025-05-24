import React, { useState } from "react";
import { UserGrid } from "@/components/UserGrid";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Users, MessageSquare } from "lucide-react";
import { IconicChat } from "@/components/IconicChat";
import { useWallet, ConnectButton } from "@suiet/wallet-kit";
import { usePaywall } from "@/lib/sui";

const tabList = [
  { key: "chat", icon: <MessageSquare className="w-5 h-5" /> },
  { key: "members", icon: <Users className="w-5 h-5" /> },
];

export default function IconicNetworkPage() {
  const { isIconic, user, token } = useAuth();
  const { connected, connect } = useWallet();
  const { payFee } = usePaywall();
  const [waiting, setWaiting] = useState(false);
  const [tab, setTab] = useState<"members" | "chat">("chat");

  async function handleSubscribe() {
    try {
      if (!connected) {
        await connect();
        return;
      }
      setWaiting(true);
      const txId = await payFee(0.1); // 0.1 SUI on Sui Testnet
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/iconic/${user!.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Transaction-Id": txId,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );
      if (res.ok) {
        window.location.reload();
      } else if (res.status === 403) {
        alert("Pending promotion: please refresh after confirmation.");
      } else {
        throw new Error("Unexpected error: " + res.status);
      }
    } catch (err: any) {
      console.error("Error during ICONIC upgrade:", err);
      alert(
        err.message ||
          JSON.stringify(err) ||
          "Unknown error during upgrade process."
      );
    } finally {
      setWaiting(false);
    }
  }

  // NOT ICONIC: Show beautiful full-width block, not a modal
  if (!isIconic) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 pb-[90px]">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4 pt-12">
          <div
            className="w-full max-w-md rounded-2xl p-0
              bg-gradient-to-br from-[#FF8CAB] via-[#FF72D3] to-[#6A4CFF] animate-gradient-pan
              shadow-xl"
            style={{
              boxShadow: "0 8px 40px 0 rgba(106, 76, 255, 0.18)",
            }}
          >
            <div className="rounded-2xl bg-white/95 px-7 py-8 flex flex-col items-center gap-3">
              <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#FF8CAB] via-[#FF72D3] to-[#6A4CFF] tracking-tight uppercase mb-1">
                Become ICONIC
              </span>
              <span className="text-base font-medium text-gray-700 tracking-wide text-center">
                Unlock exclusive experiences and join the ICONIC circle.
              </span>
              <ul className="text-gray-600 text-sm my-2 text-left list-disc pl-4 space-y-1">
                <li>Access premium, members-only events.</li>
                <li>Showcase your ICONIC badge across the platform.</li>
                <li>Priority entry, VIP opportunities, and more.</li>
              </ul>
              <div className="my-2 w-full text-center">
                <div className="inline-block bg-gradient-to-r from-[#FF8CAB] via-[#FF72D3] to-[#6A4CFF] px-4 py-2 rounded-full text-white font-semibold text-base shadow animate-pulse">
                  Only <span className="font-extrabold">0.1 SUI</span> on Sui
                  Testnet
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">
                <span className="font-bold text-[#6A4CFF]">
                  Ultra-fast payment
                </span>{" "}
                powered by <span className="font-bold">Sui Blockchain</span>.
                Just approve in your wallet and you’re in!
              </p>
              <div className="flex flex-col w-full mt-6 gap-3">
                {!connected ? (
                  <ConnectButton className="w-full py-2 bg-gray-800 text-white rounded-lg text-lg font-bold" />
                ) : (
                  <button
                    onClick={handleSubscribe}
                    disabled={waiting}
                    className={`w-full py-3 rounded-xl font-bold text-lg shadow transition-all
                      ${
                        waiting
                          ? "bg-gray-400 cursor-wait"
                          : "bg-gradient-to-r from-[#FF8CAB] via-[#FF72D3] to-[#6A4CFF] text-white hover:brightness-105 animate-gradient-pan"
                      }`}
                  >
                    {waiting ? "Processing…" : "Become ICONIC Now"}
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-400 text-center mt-3">
                Payments on <span className="font-medium">Sui Testnet</span>. No
                real funds required.
              </div>
            </div>
          </div>
        </main>
        {/* Padding for iOS Safari */}
        <div className="h-24 sm:h-0" />
        <BottomNav />
        <style>{`
          @keyframes gradient-pan {
            0%,100% {background-position:0% 50%;}
            50%{background-position:100% 50%;}
          }
          .animate-gradient-pan {
            background-size: 200% 200%;
            animation: gradient-pan 4s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  // ICONIC member view
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 pb-[90px]">
      <Header />
      <main className="flex-1 flex flex-col items-center w-full max-w-xl mx-auto px-0 pt-16">
        {/* Tabs */}
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
            height: "calc(100vh - 64px - 56px - 56px)",
            maxHeight: "calc(100vh - 64px - 56px - 56px)",
            paddingBottom: 24,
          }}
        >
          {tab === "chat" ? (
            <IconicChat />
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <h3 className="text-lg font-semibold text-purple-700 text-center mb-1">
                ICONIC Members
              </h3>
              <p className="text-sm text-gray-400 text-center mb-3">
                Connect with fellow streetwear members.
              </p>
              <UserGrid endpoint="/iconic/members" compact />
            </div>
          )}
        </div>
      </main>
      <div className="h-24 sm:h-0" />
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
