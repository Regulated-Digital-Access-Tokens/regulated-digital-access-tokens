import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "./useWallet";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig";

/**
 * useGetListings
 *
 * Fetches all active marketplace listings using Event Logs discovery.
 *
 * Strategy (Event discovery):
 *   1. Queries the `TokenListed` event logs to find all tokens ever listed.
 *   2. For each unique tokenId, calls `listings(tokenId)` to check if `isListed` is true.
 *   3. Formats BigInt prices to human-readable strings.
 */
export function useGetListings() {
  const { provider } = useWallet();

  const [listings, setListings]   = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);

  const fetchListings = useCallback(async () => {
    if (!provider) return;

    setIsLoading(true);
    setError(null);

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Step 1: Query all "TokenListed" events from the start of the contract deployment.
      // Note: In production, you'd specify a starting block number to speed this up.
      const filter = contract.filters.TokenListed();
      const events = await contract.queryFilter(filter);

      // Get unique token IDs from the events (most recent first)
      const tokenIds = [...new Set(events.map(e => e.args.tokenId))];

      if (tokenIds.length === 0) {
        setListings([]);
        return;
      }

      // Step 2: Check on-chain if each token is still listed (hasn't been bought or cancelled)
      // Also fetch the metadata URI and original mint price for the UI.
      const listingDetails = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const { price, seller, isListed } = await contract.listings(tokenId);
            if (!isListed) return null;

            const uri = await contract.tokenURI(tokenId);
            const mintPrice = await contract.mintPrices(tokenId);

            return {
              tokenId:  tokenId.toString(),
              price:    ethers.formatEther(price),
              priceRaw: price,
              seller:   seller,
              tokenURI: uri,
              mintPrice: ethers.formatEther(mintPrice)
            };
          } catch {
            return null;
          }
        })
      );

      setListings(listingDetails.filter(Boolean));
    } catch (err) {
      console.error("Listing fetch error:", err);
      setError("Failed to fetch marketplace listings.");
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    fetchListings();

    if (!provider) return;

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const onEvent = () => {
      // Small delay to ensure RPC nodes have indexed the new state
      setTimeout(() => {
        fetchListings();
      }, 1000);
    };

    // Listen to marketplace events to refresh listings
    contract.on("TokenListed", onEvent);
    contract.on("TokenSale", onEvent);
    contract.on("ListingCancelled", onEvent);

    return () => {
      contract.off("TokenListed", onEvent);
      contract.off("TokenSale", onEvent);
      contract.off("ListingCancelled", onEvent);
    };
  }, [fetchListings, provider]);

  return { listings, isLoading, error, refetch: fetchListings };
}
