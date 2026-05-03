import { useState } from "react";
import { useWallet } from "../blockchain/useWallet";
import { useGetOwnedTokens } from "../blockchain/useGetOwnedTokens";
import { useListToken } from "../blockchain/useListToken";

/**
 * DashboardView
 *
 * Displays a responsive grid of tokens owned by the connected wallet.
 * Each inventory card shows the Token ID and provides a price input +
 * "List on Market" button wired into the useListToken hook.
 */
export default function DashboardView() {
  const { address, isConnected } = useWallet();
  const { ownedTokenIds, isLoading, error } = useGetOwnedTokens(address);
  const {
    list,
    isLoading: isListing,
    error: listError,
  } = useListToken();

  // Track per-token listing prices locally.
  const [prices, setPrices] = useState({});

  const handlePriceChange = (tokenId, value) => {
    setPrices((prev) => ({ ...prev, [tokenId]: value }));
  };

  if (!isConnected) {
    return <p className="p-4">Connect your wallet to view your tokens.</p>;
  }

  if (isLoading) {
    return <p className="p-4">Loading your tokens…</p>;
  }

  if (error) {
    return <p className="p-4">{error}</p>;
  }

  if (ownedTokenIds.length === 0) {
    return <p className="p-4">You don't own any tokens yet.</p>;
  }

  return (
    <div className="p-4">
      {listError && <p className="mb-4">{listError}</p>}

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        id="dashboard-grid"
      >
        {ownedTokenIds.map((tokenId) => (
          <div key={tokenId} className="p-4" id={`owned-${tokenId}`}>
            <p>Token #{tokenId}</p>

            <div className="flex gap-2 mt-2">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Price (ETH)"
                value={prices[tokenId] || ""}
                onChange={(e) => handlePriceChange(tokenId, e.target.value)}
                id={`price-input-${tokenId}`}
              />
              <button
                disabled={isListing || !prices[tokenId]}
                onClick={() => list(tokenId, prices[tokenId])}
                id={`list-btn-${tokenId}`}
              >
                {isListing ? "Processing..." : "List on Market"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
