import { useGetListings } from "../blockchain/useGetListings";
import { useBuyToken } from "../blockchain/useBuyToken";

/**
 * MarketplaceView
 *
 * Displays a responsive grid of all tokens currently listed for sale.
 * Each card shows the Token ID, price in ETH, and a Buy button wired
 * into the useBuyToken hook with proper async loading states.
 */
export default function MarketplaceView() {
  const { listings, isLoading, error } = useGetListings();
  const { buy, isLoading: isBuying, error: buyError } = useBuyToken();

  if (isLoading) {
    return <p className="p-4">Loading marketplace listings…</p>;
  }

  if (error) {
    return <p className="p-4">{error}</p>;
  }

  if (listings.length === 0) {
    return <p className="p-4">No tokens are currently listed for sale.</p>;
  }

  return (
    <div className="p-4">
      {buyError && <p className="mb-4">{buyError}</p>}

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        id="marketplace-grid"
      >
        {listings.map((listing) => (
          <div key={listing.tokenId} className="p-4" id={`listing-${listing.tokenId}`}>
            <p>Token #{listing.tokenId}</p>
            <p>{listing.price} ETH</p>
            <p>Seller: {listing.seller}</p>
            <button
              disabled={isBuying}
              onClick={() => buy(listing.tokenId, listing.priceRaw)}
              id={`buy-btn-${listing.tokenId}`}
            >
              {isBuying ? "Processing..." : "Buy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
