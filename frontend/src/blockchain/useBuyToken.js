import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "./useWallet";
import { useTransaction } from "./TransactionContext";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig";
import { parseTransactionError } from "./errorHandler";

/**
 * useBuyToken
 *
 * Buys a listed token.
 * Automatically handles msg.value based on the current listing price.
 */
export function useBuyToken() {
  const { signer } = useWallet();
  const { startTransaction, endTransaction } = useTransaction();

  const [isPromptingWallet, setIsPromptingWallet] = useState(false);
  const [isMining, setIsMining]                   = useState(false);
  const [error, setError]                         = useState(null);
  const [success, setSuccess]                     = useState(false);

  const buyToken = useCallback(async (tokenId) => {
    if (!signer) {
      setError("Wallet not connected.");
      return;
    }

    setError(null);
    setSuccess(false);
    setIsPromptingWallet(true);

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Fetch the current listing to get the required price
      const { price, isListed } = await contract.listings(tokenId);
      
      if (!isListed) {
        throw new Error("Token is no longer listed for sale.");
      }

      // Execute purchase
      const tx = await contract.buyToken(tokenId, {
        value: price
      });

      setIsPromptingWallet(false);
      setIsMining(true);
      startTransaction();

      const receipt = await tx.wait();
      if (receipt.status === 1) setSuccess(true);
      else setError("Transaction failed on-chain.");

    } catch (err) {
      console.error("Purchase error:", err);
      // We manually threw an Error above if it wasn't listed, so we check for that first.
      if (err.message === "Token is no longer listed for sale.") {
        setError(err.message);
      } else {
        setError(parseTransactionError(err));
      }
    } finally {
      setIsPromptingWallet(false);
      setIsMining(false);
      endTransaction();
    }
  }, [signer, startTransaction, endTransaction]);

  return { buyToken, isPromptingWallet, isMining, error, success };
}
