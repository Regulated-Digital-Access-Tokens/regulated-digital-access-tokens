import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "./useWallet";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig";
import { useTransaction } from "./TransactionContext";

/**
 * useMintToken
 *
 * Provides a `mint(metadata)` function that sends a transaction
 * to mint a new token. The metadata string is optional — the contract
 * may or may not use it depending on the Protocol Architect's design.
 *
 * Usage:
 *   const { mint, isLoading, error } = useMintToken();
 *   mint("some-metadata-string");
 *
 * @returns {{ mint: Function, isLoading: boolean, error: string|null }}
 */
export function useMintToken() {
  const { signer } = useWallet();
  const { startTransaction, endTransaction } = useTransaction();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mint = useCallback(
    async (metadata = "") => {
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

        const tx = await contract.mintToken(metadata);
        await tx.wait();
      } catch (err) {
        if (err.code === "ACTION_REJECTED") {
          setError("Transaction rejected by user.");
        } else {
          setError("Failed to mint token. Please try again.");
        }
      } finally {
        setIsLoading(false);
        endTransaction();
      }
    },
    [signer, startTransaction, endTransaction]
  );

  return { mint, isLoading, error };
}
