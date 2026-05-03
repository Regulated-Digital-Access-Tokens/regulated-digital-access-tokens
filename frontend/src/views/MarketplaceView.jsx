import { useGetListings } from "../blockchain/useGetListings";
import { useBuyToken } from "../blockchain/useBuyToken";
import DecryptedText from "../components/DecryptedText";

const DUMMY_LISTINGS = [
  { tokenId: "9991", price: "0.25", priceRaw: "250000000000000000", seller: "0xAbstractGlass", image: "/assets/token_card_1_1777824644342.png" },
  { tokenId: "9992", price: "1.50", priceRaw: "1500000000000000000", seller: "0xHoloGeo", image: "/assets/token_card_2_1777824662613.png" },
  { tokenId: "9993", price: "0.08", priceRaw: "80000000000000000", seller: "0xMetallicVault", image: "/assets/token_card_3_1777824676332.png" }
];

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
  return (
    <div className="product-card" id={`listing-${listing.tokenId}`}>
      {/* Media placeholder — 22px radius per image treatment rules */}
      <div
        className="media-card"
        style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", backgroundColor: "var(--color-near-black)", overflow: "hidden" }}
      >
        {listing.image ? (
          <img src={listing.image} alt={`Token ${listing.tokenId}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
            style={{ fontSize: "16px", fontWeight: 500, marginBottom: "2px", truncate: true }}
          >
            Token #{listing.tokenId}
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
  const { buy, isLoading: isBuying, error: buyError } = useBuyToken();

  return (
    <div>
      {/* Hero band — centered text, large empty space above grid */}
      <section
        style={{
          backgroundColor: "transparent",
          padding: "80px 24px 64px",
          textAlign: "center",
        }}
      >
        <div className="section-container" style={{ maxWidth: "800px" }}>
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
      <section style={{ padding: "56px 0 80px", backgroundColor: "var(--color-white)", position: "relative", zIndex: 10 }}>
        <div className="section-container">
          {/* Error banners */}
          {buyError && (
            <div className="status-strip--error mb-6" style={{ padding: "12px 16px", marginBottom: "24px", borderRadius: "var(--radius-xs)", border: "1px solid rgba(179,0,0,0.2)", backgroundColor: "#fff0f0", color: "var(--color-error)", fontSize: "14px" }}>
              {buyError}
            </div>
          )}

          {/* Loading state — skeleton grid */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Loading listings">
              {[1, 2, 3].map((i) => <ListingSkeleton key={i} />)}
            </div>
          )}

          {/* Fetch error */}
          {!isLoading && error && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p className="text-body-lg" style={{ color: "var(--color-muted)" }}>{error}</p>
            </div>
          )}

          {/* Empty state or Dummy Cards */}
          {!isLoading && !error && listings.length === 0 && (
            <div>
              <div style={{ textAlign: "center", padding: "40px 0 60px" }}>
                <p className="text-body-lg" style={{ color: "var(--color-muted)" }}>
                  No tokens are currently listed for sale on the blockchain.
                </p>
                <p className="text-caption" style={{ marginTop: "8px" }}>
                  Here are some sample tokens so you can see how the UI looks:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {DUMMY_LISTINGS.map((listing) => (
                  <ListingCard
                    key={listing.tokenId}
                    listing={listing}
                    onBuy={(id) => alert(`This is a sample token (${id}). Connect your wallet and list real tokens to buy them.`)}
                    isBuying={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Listings grid */}
          {!isLoading && !error && listings.length > 0 && (
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              id="marketplace-grid"
            >
              {listings.map((listing) => (
                <ListingCard
                  key={listing.tokenId}
                  listing={listing}
                  onBuy={buy}
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
