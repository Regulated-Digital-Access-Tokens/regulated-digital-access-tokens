import { useGetListings } from "../blockchain/useGetListings";
import { useBuyToken } from "../blockchain/useBuyToken";
import DecryptedText from "../components/DecryptedText";
import Lottie from "lottie-react";
import removeItemAnim from "../../public/assets/remove-item.json";
import SnakeMarquee from "../components/SnakeMarquee";
import HalftoneHandsBackground from "../components/HalftoneHandsBackground";

/* --------------------------------------------------------------------------
   Skeleton card — Caldera style (Limestone shimmer, 40px radius)
   -------------------------------------------------------------------------- */
function ListingSkeleton() {
  return (
    <div className="product-card" aria-hidden="true">
      <div className="skeleton" style={{ height: "180px", borderRadius: "var(--radius-medium)" }} />
      <div className="skeleton" style={{ height: "16px", width: "60%", borderRadius: "var(--radius-small)" }} />
      <div className="skeleton" style={{ height: "14px", width: "40%", borderRadius: "var(--radius-small)" }} />
    </div>
  );
}

/* --------------------------------------------------------------------------
   Single listing card — Caldera product-card
   Limestone surface, 40px radius, Ember accent buy button
   -------------------------------------------------------------------------- */
function ListingCard({ listing, onBuy, isBuying }) {
  return (
    <div className="product-card" id={`listing-${listing.tokenId}`}>
      {/* Media area — Obsidian bg with 40px radius */}
      <div
        className="media-card"
        style={{
          height: "180px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          margin: `calc(-1 * var(--card-padding))`,
          marginBottom: "0",
          borderRadius: "var(--radius-cards) var(--radius-cards) 0 0",
        }}
      >
        {listing.image ? (
          <img src={listing.image} alt={`Token ${listing.tokenId}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            TOKEN #{listing.tokenId}
          </span>
        )}
      </div>

      {/* Card body */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", paddingTop: "var(--spacing-16)" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Sulfur tag */}
          <span className="chip" style={{ marginBottom: "10px", fontSize: "12px", padding: "3px 8px" }}>
            ACCESS TOKEN
          </span>
          <p
            className="text-subheading"
            style={{ marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {listing.metadata || `Token #${listing.tokenId}`}
          </p>
          {listing.metadata && (
            <span className="text-micro" style={{ display: "block", marginBottom: "2px" }}>
              Token #{listing.tokenId}
            </span>
          )}
          <p className="text-micro">
            {listing.seller.slice(0, 6)}…{listing.seller.slice(-4)}
          </p>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p className="text-micro" style={{ marginBottom: "4px" }}>Price</p>
          <p className="price-badge">{listing.price} ETH</p>
        </div>
      </div>

      {/* Dotted divider */}
      <div className="product-card__divider" />

      {/* Action row */}
      <div className="flex items-center justify-between">
        <span className="text-micro">
          {/* Future: time-left data */}
        </span>
        <button
          className="btn-primary"
          style={{ padding: "10px 24px", fontSize: "14px" }}
          disabled={isBuying}
          onClick={() => onBuy(listing.tokenId, listing.priceRaw)}
          id={`buy-btn-${listing.tokenId}`}
        >
          {isBuying ? "Processing…" : "Buy Now"}
        </button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   MarketplaceView — Caldera
   Obsidian hero with halftone dots → Pumice listing grid
   -------------------------------------------------------------------------- */
export default function MarketplaceView() {
  const { listings, isLoading, error } = useGetListings();
  const { buyToken, isPromptingWallet, isMining, error: buyError } = useBuyToken();
  const isBuying = isPromptingWallet || isMining;

  return (
    <div>
      {/* Hero — Obsidian with ASCII Hands background */}
      <section className="feature-band" style={{ backgroundColor: "var(--color-obsidian)", position: "relative" }}>
        <HalftoneHandsBackground theme="dark" />
        <div
          className="section-container"
          style={{
            padding: "140px 24px 80px",
            position: "relative",
            zIndex: 1,
            maxWidth: "900px",
            textAlign: "center"
          }}
        >
          <DecryptedText
            text="The Global Marketplace"
            className="text-product-display text-chalk"
            style={{ marginBottom: "24px", display: "block", textAlign: "center", width: "100%" }}
            scrambleColor="rgba(252, 80, 0, 0.8)"
          />
          <p
            className="text-body-lg"
            style={{
              color: "rgba(255,255,255,0.55)",
              maxWidth: "520px",
              margin: "0 auto",
              textAlign: "center"
            }}
          >
            Discover and collect regulated digital access tokens.
            Secured on-chain. Unfiltered access.
          </p>
        </div>
      </section>

      {/* Dotted separator */}
      <div className="divider" />

      {/* Content section — Pumice canvas */}
      <section style={{ padding: "var(--spacing-80) 0 120px", position: "relative", overflow: "hidden", minHeight: "50vh" }}>
        <SnakeMarquee />
        <div className="section-container" style={{ position: "relative", zIndex: 1, pointerEvents: "none" }}>
          {/* Error banners */}
          {buyError && (
            <div
              className="status-strip--error"
              style={{ padding: "14px 18px", marginBottom: "24px", fontSize: "var(--text-body-sm)" }}
            >
              {buyError}
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Loading listings" style={{ pointerEvents: "auto" }}>
              {[1, 2, 3].map((i) => <ListingSkeleton key={i} />)}
            </div>
          )}

          {/* Fetch error */}
          {!isLoading && error && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p className="text-body-lg" style={{ color: "rgba(7, 6, 7, 0.5)" }}>{error}</p>
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
              <p className="text-heading" style={{ marginBottom: "8px" }}>
                No Tokens Listed
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
