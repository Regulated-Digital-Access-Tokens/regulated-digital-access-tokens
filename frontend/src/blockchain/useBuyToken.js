import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "./useWallet";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig";
import { useTransaction } from "./TransactionContext";

/**
 * useBuyToken
 *
 * Provides a `buy(tokenId, priceRaw)` function that sends a transaction
 * to purchase a listed token on the marketplace.
 *
 * Usage:
 *   const { buy, isLoading, error } = useBuyToken();
 *   buy(tokenId, priceRaw); // priceRaw is the BigInt value in Wei
 *
 * @returns {{ buy: Function, isLoading: boolean, error: string|null }}
 */
export function useBuyToken() {
  const { signer } = useWallet();
  const { startTransaction, endTransaction } = useTransaction();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const buy = useCallback(
    async (tokenId, priceRaw) => {
      if (!signer) {
        setError("Wallet not connected.");
        return;
      }

      setIsLoading(true);
      setError(null);
      startTransaction();

      try {
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );

        const tx = await contract.buyToken(tokenId, { value: priceRaw });
        await tx.wait();
      } catch (err) {
        if (err.code === "ACTION_REJECTED") {
          setError("Transaction rejected by user.");
        } else {
          setError("Failed to buy token. Please try again.");
        }
      } finally {
        setIsLoading(false);
        endTransaction();
      }
    },
    [signer, startTransaction, endTransaction]
  );

  return { buy, isLoading, error };
}
