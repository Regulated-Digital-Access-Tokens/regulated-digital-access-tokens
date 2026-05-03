import { useState, useEffect, useCallback } from "react";
import { useWallet } from "./useWallet";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig";
import { ethers } from "ethers";

/**
 * useGetOwnedTokens
 *
 * Fetches the list of token IDs owned by a given wallet address.
 *
 * Strategy (Q2 Option A — ERC721Enumerable):
 *   1. Calls `balanceOf(ownerAddress)` to get total token count.
 *   2. Loops from 0 to count-1, calling `tokenOfOwnerByIndex(owner, i)` for each.
 *      All index calls are made in parallel for efficiency.
 *   ⚠️ The Protocol Architect must inherit from OpenZeppelin's ERC721Enumerable
 *      for this hook to work. Standard ERC721 alone does NOT have tokenOfOwnerByIndex.
 *
 * Handoff for Frontend Visionary:
 *   const { ownedTokenIds, isLoading, error, refetch } = useGetOwnedTokens(address);
 *
 *   ownedTokenIds → string[] of token ID strings, e.g. ["1", "3", "7"]
 *   isLoading     → Show a loading skeleton while true.
 *   error         → Show an error message if non-null.
 *   refetch       → Call after a mintToken to refresh the user's collection.
 *
 * Typical usage in a component:
 *   const { address } = useWallet();
 *   const { ownedTokenIds, isLoading } = useGetOwnedTokens(address);
 *
 * @param {string | null} ownerAddress - The wallet address to query. Pass null to skip.
 */
export function useGetOwnedTokens(ownerAddress) {
  const { provider } = useWallet();

  const [ownedTokenIds, setOwnedTokenIds] = useState([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState(null);

  const fetchOwnedTokens = useCallback(async () => {
    // Do nothing if wallet not connected or no address provided.
    if (!provider || !ownerAddress) {
      setOwnedTokenIds([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Step 1: Get token count. Returns BigInt in Ethers v6.
      const balance = await contract.balanceOf(ownerAddress);
      const count   = Number(balance); // Safe: token counts never exceed JS MAX_SAFE_INTEGER

      if (count === 0) {
        setOwnedTokenIds([]);
        return;
      }

      // Step 2: Fetch each tokenId by index in parallel (ERC721Enumerable).
      // Array.from({ length: count }, (_, i) => i) gives us [0, 1, 2, ..., count-1].
      const tokenIds = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          contract.tokenOfOwnerByIndex(ownerAddress, i)
        )
      );

      // Convert BigInt token IDs to strings for safe use as React keys and display.
      setOwnedTokenIds(tokenIds.map((id) => id.toString()));
    } catch (err) {
      setError("Failed to fetch your tokens. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [provider, ownerAddress]);

  // Re-fetch whenever the provider or target address changes.
  useEffect(() => {
    fetchOwnedTokens();
  }, [fetchOwnedTokens]);

  return {
    ownedTokenIds, // string[] — e.g. ["1", "3", "7"]
    isLoading,     // boolean
    error,         // string | null
    refetch: fetchOwnedTokens, // Call after minting to refresh the user's collection
  };
}
