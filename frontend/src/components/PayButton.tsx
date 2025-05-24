import React, { useState } from "react";
import { usePaywall } from "@/lib/sui";
import { useWallet } from "@suiet/wallet-kit";

export function PayButton() {
  const { connected } = useWallet();
  const { payFee } = usePaywall();
  const [loading, setLoading] = useState(false);

  if (!connected) {
    return <p>Conecte sua wallet para pagar.</p>;
  }

  async function handlePay() {
    setLoading(true);
    try {
      const result = await payFee(1); // 1 SUI
      console.log("Tx digest:", result.digest);
      alert("Pagamento realizado! Acesso liberado.");
      // Opcional: envie result.digest ao backend para confirmação
    } catch (err) {
      console.error(err);
      alert("Falha no pagamento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handlePay} disabled={loading}>
      {loading ? "Processando..." : "Pagar 1 SUI"}
    </button>
  );
}