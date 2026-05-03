import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "./useWallet";
import { useTransaction } from "./TransactionContext";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig";
import { parseTransactionError } from "./errorHandler";

/**
 * useMintToken
 *
 * Mints a new token.
 * Requires URI (metadata) and initial price.
 */
export function useMintToken() {
  const { signer } = useWallet();
  const { startTransaction, endTransaction } = useTransaction();

  const [isPromptingWallet, setIsPromptingWallet] = useState(false);
  const [isMining, setIsMining]                   = useState(false);
  const [error, setError]                         = useState(null);
  const [success, setSuccess]                     = useState(false);

  const mintToken = useCallback(async (tokenURI, priceInEth) => {
    if (!signer) {
      setError("Wallet not connected.");
      return;
    }

    setError(null);
    setSuccess(false);
    setIsPromptingWallet(true);

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const priceInWei = ethers.parseEther(priceInEth.toString());

      // Debug: log key values
      const balance = await signer.provider.getBalance(await signer.getAddress());
      const network = await signer.provider.getNetwork();
      console.log("[Mint Debug]", {
        tokenURILength: tokenURI.length,
        priceInWei: priceInWei.toString(),
        walletBalance: ethers.formatEther(balance),
        network: network.name,
        chainId: network.chainId.toString(),
        contractAddress: CONTRACT_ADDRESS,
      });

      // Send transaction
      const tx = await contract.mintToken(tokenURI, priceInWei, {
        value: priceInWei
      });

      setIsPromptingWallet(false);
      setIsMining(true);
      startTransaction(); // Trigger global UI toast

      const receipt = await tx.wait();
      if (receipt.status === 1) setSuccess(true);
      else setError("Transaction failed on-chain.");

    } catch (err) {
      console.error("Mint error (full):", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      console.error("Mint error:", err);
      setError(parseTransactionError(err));
    } finally {
      setIsPromptingWallet(false);
      setIsMining(false);
      endTransaction(); // Hide global UI toast
    }
  }, [signer, startTransaction, endTransaction]);

  return { mintToken, isPromptingWallet, isMining, error, success };
}
