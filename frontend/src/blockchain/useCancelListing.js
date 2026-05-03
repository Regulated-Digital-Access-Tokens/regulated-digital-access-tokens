import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "./useWallet";
import { useTransaction } from "./TransactionContext";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig";
import { parseTransactionError } from "./errorHandler";

/**
 * useCancelListing
 *
 * Cancels an active listing.
 */
export function useCancelListing() {
  const { signer } = useWallet();
  const { startTransaction, endTransaction } = useTransaction();

  const [isPromptingWallet, setIsPromptingWallet] = useState(false);
  const [isMining, setIsMining]                   = useState(false);
  const [error, setError]                         = useState(null);
  const [success, setSuccess]                     = useState(false);

  const cancelListing = useCallback(async (tokenId) => {
    if (!signer) {
      setError("Wallet not connected.");
      return;
    }

    setError(null);
    setSuccess(false);
    setIsPromptingWallet(true);

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.cancelListing(tokenId);

      setIsPromptingWallet(false);
      setIsMining(true);
      startTransaction();

      const receipt = await tx.wait();
      if (receipt.status === 1) setSuccess(true);
      else setError("Transaction failed on-chain.");

    } catch (err) {
      console.error("Cancel listing error:", err);
      setError(parseTransactionError(err));
    } finally {
      setIsPromptingWallet(false);
      setIsMining(false);
      endTransaction();
    }
  }, [signer, startTransaction, endTransaction]);

  return { cancelListing, isPromptingWallet, isMining, error, success };
}
