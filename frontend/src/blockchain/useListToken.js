import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "./useWallet";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig";
import { useTransaction } from "./TransactionContext";

/**
 * useListToken
 *
 * Provides a `list(tokenId, priceInEth)` function that sends a transaction
 * to list an owned token on the marketplace at a given price.
 *
 * Usage:
 *   const { list, isLoading, error } = useListToken();
 *   list(tokenId, "0.5"); // priceInEth is a string like "0.5"
 *
 * @returns {{ list: Function, isLoading: boolean, error: string|null }}
 */
export function useListToken() {
  const { signer } = useWallet();
  const { startTransaction, endTransaction } = useTransaction();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const list = useCallback(
    async (tokenId, priceInEth) => {
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

        const priceInWei = ethers.parseEther(priceInEth);
        const tx = await contract.listToken(tokenId, priceInWei);
        await tx.wait();
      } catch (err) {
        if (err.code === "ACTION_REJECTED") {
          setError("Transaction rejected by user.");
        } else {
          setError("Failed to list token. Please try again.");
        }
      } finally {
        setIsLoading(false);
        endTransaction();
      }
    },
    [signer, startTransaction, endTransaction]
  );

  return { list, isLoading, error };
}
