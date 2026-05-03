import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "./useWallet";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig";

/**
 * useGetListings
 *
 * Fetches all active marketplace listings from the smart contract.
 *
 * Strategy (Q1 Option B):
 *   1. Calls `getActiveListingIds()` on the contract to get an array of listed tokenIds.
 *      ⚠️ The Protocol Architect must implement this on-chain getter. Confirm the
 *      exact function name before switching off the mock ABI.
 *   2. For each tokenId, calls `getListing(tokenId)` to fetch price + seller in parallel.
 *   3. Formats raw BigInt prices to human-readable ETH strings via ethers.formatEther().
 *
 * Handoff for Frontend Visionary:
 *   const { listings, isLoading, error, refetch } = useGetListings();
 *
 *   listings → Array of: { tokenId: string, price: string (ETH), priceRaw: BigInt, seller: string }
 *   isLoading → Show a loading skeleton/spinner while true.
 *   error     → Show an error message if non-null.
 *   refetch   → Call after a buyToken or cancelListing to refresh the list.
 *
 * Requires: Wallet must be connected (provider available from WalletContext).
 */
export function useGetListings() {
  const { provider } = useWallet();

  const [listings, setListings]   = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);

  const fetchListings = useCallback(async () => {
    // Do nothing until the wallet is connected and we have a provider.
    if (!provider) return;

    setIsLoading(true);
    setError(null);

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Step 1: Get all active listing IDs from the contract's on-chain array.
      // Returns uint256[] — Ethers v6 gives us BigInt[].
      const listingIds = await contract.getActiveListingIds();

      if (listingIds.length === 0) {
        setListings([]);
        return;
      }

      // Step 2: Fetch price + seller for each tokenId in parallel.
      const listingDetails = await Promise.all(
        listingIds.map(async (tokenId) => {
          try {
            const { price, seller } = await contract.getListing(tokenId);
            return {
              tokenId:  tokenId.toString(),  // Convert BigInt → string (safe as React key)
              price:    ethers.formatEther(price), // Wei BigInt → "0.55" ETH string
              priceRaw: price,               // Keep raw BigInt for buyToken's { value } override
              seller,                        // Already an address string
            };
          } catch {
            // If a single token's fetch fails (e.g., was just de-listed), skip it.
            return null;
          }
        })
      );

      // Step 3: Filter out any null results from individual fetch failures.
      setListings(listingDetails.filter(Boolean));
    } catch (err) {
      setError("Failed to fetch marketplace listings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  // Auto-fetch on mount and whenever the provider changes (e.g., wallet connects).
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,   // { tokenId, price, priceRaw, seller }[]
    isLoading,  // boolean
    error,      // string | null
    refetch: fetchListings, // Call this after a buy or cancel to refresh the UI
  };
}
