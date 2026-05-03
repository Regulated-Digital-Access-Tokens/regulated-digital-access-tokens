import { useGetListings } from "../blockchain/useGetListings";
import { useBuyToken } from "../blockchain/useBuyToken";
import DecryptedText from "../components/DecryptedText";
import Lottie from "lottie-react";
import removeItemAnim from "../../public/assets/remove-item.json";
import SnakeMarquee from "../components/SnakeMarquee";

/* --------------------------------------------------------------------------
   Skeleton card shown while listings are loading
   -------------------------------------------------------------------------- */
function ListingSkeleton() {
  return (
    <div className="product-card" aria-hidden="true">
      <div className="skeleton" style={{ height: "160px", borderRadius: "var(--radius-sm)" }} />
      <div className="skeleton" style={{ height: "14px", width: "60%", borderRadius: "var(--radius-xs)" }} />
      <div className="skeleton" style={{ height: "12px", width: "40%", borderRadius: "var(--radius-xs)" }} />
    </div>
  );
}

/* --------------------------------------------------------------------------
   Single listing card — product-card pattern from DESIGN.md
   -------------------------------------------------------------------------- */
function ListingCard({ listing, onBuy, isBuying }) {
  // Parse metadata JSON safely
  let metadata = { description: listing.tokenURI, image: null };
  try {
    if (listing.tokenURI.startsWith("{")) {
      metadata = JSON.parse(listing.tokenURI);
    }
  } catch (e) {
    // Fallback to plain string
  }

  const displayImage = metadata.image || null;
  const displayDesc = metadata.description || `Token #${listing.tokenId}`;
  return (
    <div className="product-card" id={`listing-${listing.tokenId}`}>
      {/* Media placeholder — 22px radius per image treatment rules */}
      <div
        className="media-card"
        style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", backgroundColor: "var(--color-near-black)", overflow: "hidden" }}
      >
        {displayImage ? (
          <img src={displayImage} alt={`Token ${listing.tokenId}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span className="text-mono-label" style={{ opacity: 0.4, color: "var(--color-white)" }}>
            TOKEN #{listing.tokenId}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="flex items-start justify-between gap-4">
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            className="text-feature-heading"
            style={{ fontSize: "16px", fontWeight: 500, marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            title={displayDesc}
          >
            {displayDesc}
          </p>
          <p className="text-caption" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05px" }}>
            {listing.seller.slice(0, 6)}…{listing.seller.slice(-4)}
          </p>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p className="text-caption" style={{ marginBottom: "2px" }}>Price</p>
          <p className="price-badge">{listing.price} ETH</p>
        </div>
      </div>

      {/* Divider */}
      <div className="product-card__divider" />

      {/* Action row */}
      <div className="flex items-center justify-between">
        <span className="text-caption" style={{ fontSize: "12px" }}>
          {/* Future: time-left data */}
        </span>
        <button
          className="btn-primary"
          style={{ padding: "10px 20px", fontSize: "13px" }}
          disabled={isBuying}
          onClick={() => onBuy(listing.tokenId, listing.priceRaw)}
          id={`buy-btn-${listing.tokenId}`}
        >
          {isBuying ? "Processing…" : "Buy"}
        </button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   MarketplaceView
   Hero → product-card grid (3-col desktop)
   -------------------------------------------------------------------------- */
export default function MarketplaceView() {
  const { listings, isLoading, error } = useGetListings();
  const { buyToken, isPromptingWallet, isMining, error: buyError } = useBuyToken();
  const isBuying = isPromptingWallet || isMining;

  return (
    <div>
      {/* Hero — transparent with dot matrix background */}
      <section className="feature-band" style={{ backgroundColor: "transparent", position: "relative" }}>
        <div className="section-container" style={{ padding: "120px 24px 64px", position: "relative", zIndex: 1, maxWidth: "800px", textAlign: "center" }}>
          <DecryptedText
            text="The Global Marketplace"
            className="text-product-display"
            style={{ marginBottom: "24px", display: "block", textAlign: "center", width: "100%" }}
          />
          <p className="text-body-lg subhead-hover subhead-hover--light subhead-blur subhead-blur--light" style={{ color: "var(--color-slate)", maxWidth: "520px", margin: "0 auto", textAlign: "center" }}>
            Discover and collect regulated digital access tokens.
            Secured on-chain. Unfiltered access.
          </p>
        </div>
      </section>

      {/* Hairline separator */}
      <div className="divider" />

      {/* Content section */}
      <section style={{ padding: "80px 0 120px", backgroundColor: "var(--color-white)", position: "relative", overflow: "hidden", minHeight: "50vh" }}>
        <SnakeMarquee />
        <div className="section-container" style={{ position: "relative", zIndex: 1, pointerEvents: "none" }}>
          {/* Error banners */}
          {buyError && (
            <div className="status-strip--error mb-6" style={{ padding: "12px 16px", marginBottom: "24px", borderRadius: "var(--radius-xs)", border: "1px solid rgba(179,0,0,0.2)", backgroundColor: "#fff0f0", color: "var(--color-error)", fontSize: "14px" }}>
              {buyError}
            </div>
          )}

          {/* Loading state — skeleton grid */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Loading listings" style={{ pointerEvents: "auto" }}>
              {[1, 2, 3].map((i) => <ListingSkeleton key={i} />)}
            </div>
          )}

          {/* Fetch error */}
          {!isLoading && error && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p className="text-body-lg" style={{ color: "var(--color-muted)" }}>{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && listings.length === 0 && (
            <div 
              className="form-card" 
              style={{ 
                margin: "40px auto", 
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                pointerEvents: "auto"
              }}
            >
              <div style={{ width: "120px", height: "120px", marginBottom: "16px" }}>
                <Lottie animationData={removeItemAnim} loop={true} speed={0.8} />
              </div>
              <p className="text-body-lg" style={{ color: "var(--color-ink)", fontWeight: 500 }}>
                No tokens are currently listed for sale.
              </p>
              <p className="text-caption" style={{ marginTop: "8px", maxWidth: "320px" }}>
                The marketplace is currently waiting for new assets. Check back later or list your own tokens!
              </p>
            </div>
          )}

          {/* Listings grid */}
          {!isLoading && !error && listings.length > 0 && (
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              id="marketplace-grid"
              style={{ pointerEvents: "auto" }}
            >
              {listings.map((listing) => (
                <ListingCard
                  key={listing.tokenId}
                  listing={listing}
                  onBuy={buyToken}
                  isBuying={isBuying}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
