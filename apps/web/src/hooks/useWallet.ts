// ZZIK LIVE v4 - useWallet Hook
// Fetches user's loyalty wallet information

"use client";

import { useEffect, useState } from "react";
import type { ApiResponse } from "@/core/errors/api-response";
import type { Transaction } from "@zzik/ui";

type WalletFromApi = {
  userId: string;
  balance: number;
  transactions?: Transaction[];
};

export function useWallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    async function fetchWallet() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/loyalty/wallet", {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle 404 or auth errors gracefully
        if (res.status === 404 || res.status === 401) {
          setBalance(0);
          setTransactions([]);
          setLoading(false);
          return;
        }

        const data: ApiResponse<{ wallet: WalletFromApi }> = await res.json();

        if (!data.ok) {
          throw new Error(data.error.message);
        }

        setBalance(data.data.wallet.balance);
        setTransactions(data.data.wallet.transactions || []);
      } catch (err) {
        clearTimeout(timeoutId);
        console.error("Failed to fetch wallet:", err);

        // Distinguish between timeout and other errors
        if (err instanceof Error && err.name === "AbortError") {
          setError("요청 시간 초과 (10초)");
        } else {
          setError(err instanceof Error ? err.message : "Failed to fetch wallet");
        }

        // Fallback to 0 balance on error
        setBalance(0);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchWallet();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return { balance, transactions, loading, error };
}
