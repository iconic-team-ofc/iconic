// src/lib/sui.ts
import { Transaction } from '@mysten/sui/transactions';
import { useWallet } from '@suiet/wallet-kit';

export function usePaywall() {
  const { signAndExecuteTransactionBlock, chain } = useWallet();

  async function payFee(amountSui: number) {
    console.log('Wallet chain id:', chain?.id);
    const amount = BigInt(Math.floor(amountSui * 1e9));
    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
    tx.transferObjects([coin], tx.pure.address(import.meta.env.VITE_PAYWALL_ADDRESS!));

    const result = await signAndExecuteTransactionBlock({
      transactionBlock: tx,
      chain: chain?.id,         // e.g. "sui:testnet"
      gasBudget: 200_000,       // aumentado para teste
      options: { showEffects: true },
    });

    console.log('rawEffects:', result.rawEffects);

    // Verifica o status da transação
    if (result.effects?.status.status !== 'success') {
      console.error('Sui transaction failed:', result.effects?.status);
      throw new Error('Falha na transação Sui: ' + (result.effects?.status.error || 'Status desconhecido'));
    }

    // Retorna o digest apenas se a transação foi bem-sucedida
    return result.digest;
  }

  return { payFee };
}
