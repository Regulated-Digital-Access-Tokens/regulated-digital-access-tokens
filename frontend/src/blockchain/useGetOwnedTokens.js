import { useState, useEffect, useCallback } from "react";
import { useWallet } from "./useWallet";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig";
import { ethers } from "ethers";

/**
 * useGetOwnedTokens
 *
 * Fetches the list of token IDs owned by a given wallet address.
 *
 * Strategy (Event logs discovery):
 *   1. Queries `Transfer` event logs where `to` matches the ownerAddress.
 *   2. Collects all tokenIds the user has ever received.
 *   3. Checks `ownerOf(tokenId)` on-chain to verify they still own it.
 *
 * Handoff for Frontend Visionary:
 *   const { ownedTokenIds, isLoading, error, refetch } = useGetOwnedTokens(address);
 */
export function useGetOwnedTokens(ownerAddress) {
  const { provider } = useWallet();

  const [ownedTokenIds, setOwnedTokenIds] = useState([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState(null);

  const fetchOwnedTokens = useCallback(async () => {
    if (!provider || !ownerAddress) {
      setOwnedTokenIds([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Step 1: Query Transfer events where 'to' is the user.
      const filter = contract.filters.Transfer(null, ownerAddress);
      const events = await contract.queryFilter(filter);

      // Get unique token IDs they've received
      const potentialTokenIds = [...new Set(events.map(e => e.args.tokenId))];

      if (potentialTokenIds.length === 0) {
        setOwnedTokenIds([]);
        return;
      }

      // Step 2: Verify current ownership on-chain (in case they sold it)
      // Also fetch metadata, mint price, and listing status for the UI.
      const verifiedTokenIds = await Promise.all(
        potentialTokenIds.map(async (tokenId) => {
          try {
            const owner = await contract.ownerOf(tokenId);
            if (owner.toLowerCase() === ownerAddress.toLowerCase()) {
              const uri = await contract.tokenURI(tokenId);
              const mintPrice = await contract.mintPrices(tokenId);
              const { isListed, price } = await contract.listings(tokenId);

              return {
                tokenId: tokenId.toString(),
                tokenURI: uri,
                mintPrice: ethers.formatEther(mintPrice),
                isListed,
                listPrice: isListed ? ethers.formatEther(price) : null
              };
            }
            return null;
          } catch {
            return null;
          }
        })
      );

      setOwnedTokenIds(verifiedTokenIds.filter(Boolean));
    } catch (err) {
      console.error("Owned token fetch error:", err);
      setError("Failed to fetch your tokens.");
    } finally {
      setIsLoading(false);
    }
  }, [provider, ownerAddress]);

  useEffect(() => {
    fetchOwnedTokens();
  }, [fetchOwnedTokens]);

  return { ownedTokenIds, isLoading, error, refetch: fetchOwnedTokens };
}
