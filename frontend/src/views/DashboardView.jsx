import { useState } from "react";
import { useWallet } from "../blockchain/useWallet";
import { useGetOwnedTokens } from "../blockchain/useGetOwnedTokens";
import { useListToken } from "../blockchain/useListToken";
import DecryptedText from "../components/DecryptedText";
import Lottie from "lottie-react";
import removeItemAnim from "../../public/assets/remove-item.json";
import walletAnim from "../../public/assets/wallet.json";
import LeafMatrixBackground from "../components/LeafMatrixBackground";
import SplitText from "../components/SplitText";

/* --------------------------------------------------------------------------
   Skeleton inventory card
   -------------------------------------------------------------------------- */
function InventorySkeleton() {
  return (
    <div className="product-card" aria-hidden="true">
      <div className="skeleton" style={{ height: "100px", borderRadius: "var(--radius-xs)" }} />
      <div className="skeleton" style={{ height: "14px", width: "50%", borderRadius: "var(--radius-xs)" }} />
      <div className="skeleton" style={{ height: "36px", borderRadius: "var(--radius-xs)" }} />
    </div>
  );
}

/* --------------------------------------------------------------------------
   Single owned-token inventory card
   -------------------------------------------------------------------------- */
function InventoryCard({ token, onList, isListing, price, onPriceChange }) {
  const { tokenId, tokenURI } = token;

  // Parse metadata JSON safely
  let metadata = { description: tokenURI, image: null };
  try {
    if (tokenURI.startsWith("{")) {
      metadata = JSON.parse(tokenURI);
    }
  } catch (e) {
    // Fallback to plain string
  }

  const displayImage = metadata.image || null;
  const displayDesc = metadata.description || `Token #${tokenId}`;

  return (
    <div 
      className="form-card" 
      id={`owned-${tokenId}`}
      style={{ 
        maxWidth: "100%", // Override max-width for grid
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        gap: "24px"
      }}
    >
      <div style={{ textAlign: "left" }}>
        <span className="text-mono-label" style={{ color: "var(--color-muted)", fontSize: "12px", display: "block", marginBottom: "8px" }}>
          OWNED ASSET
        </span>
        <p
          className="text-card-heading"
          style={{ fontWeight: 500, color: "var(--color-near-black)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
          title={displayDesc}
        >
          {displayDesc}
        </p>
      </div>

      {/* Image if available */}
      {displayImage && (
        <div 
          className="media-card" 
          style={{ height: "140px", width: "100%", borderRadius: "var(--radius-sm)", overflow: "hidden", backgroundColor: "var(--color-near-black)" }}
        >
          <img src={displayImage} alt={displayDesc} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

      {/* Divider */}
      <div className="divider" style={{ margin: "0 -32px" }} />

      {/* List form */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label className="form-label" htmlFor={`price-input-${tokenId}`}>
            Listing Price (ETH)
          </label>
          <input
            className="form-input"
            id={`price-input-${tokenId}`}
            type="number"
            min="0"
            step="0.001"
            placeholder="e.g. 0.05"
            value={price || ""}
            onChange={(e) => onPriceChange(tokenId, e.target.value)}
          />
          <p className="text-caption" style={{ marginTop: "6px" }}>
            Set the price for other users to buy this token.
          </p>
        </div>
        
        <button
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
          disabled={isListing || !price}
          onClick={() => onList(tokenId, price)}
          id={`list-btn-${tokenId}`}
        >
          {isListing ? "Processing…" : "List on Marketplace"}
        </button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   DashboardView
   Dark-feature-band hero → inventory card grid
   -------------------------------------------------------------------------- */
export default function DashboardView() {
  const { address, isConnected } = useWallet();
  const { ownedTokenIds, isLoading, error } = useGetOwnedTokens(address);
  const { listToken, isPromptingWallet, isMining, error: listError } = useListToken();
  const isListing = isPromptingWallet || isMining;

  // Per-token price state
  const [prices, setPrices] = useState({});
  const handlePriceChange = (tokenId, value) =>
    setPrices((prev) => ({ ...prev, [tokenId]: value }));

  return (
    <div>
      {/* Hero — dark-feature-band (deep enterprise green) */}
      <section className="feature-band">
        <LeafMatrixBackground />
        <div
          className="section-container"
          style={{ padding: "120px 24px 64px", position: "relative", zIndex: 1, textAlign: "center" }}
        >
          <span className="text-mono-label" style={{ color: "rgba(255,255,255,0.55)", marginBottom: "12px", display: "block" }}>
            YOUR COLLECTION
          </span>
          <DecryptedText
            text="My Dashboard"
            className="text-product-display text-white"
            style={{ marginBottom: "16px", display: "block", textAlign: "center", width: "100%" }}
            scrambleColor="rgba(255,255,255,0.85)"
          />
          <p className="text-body-lg" style={{ color: "rgba(255,255,255,0.65)", maxWidth: "440px", margin: "0 auto", cursor: "default" }}>
            <SplitText 
              text="Manage your regulated access tokens and list them on the marketplace." 
              charClassName="char-item" 
              animationType="tumble"
            />
          </p>
        </div>
      </section>

      {/* Content section */}
      <section style={{ padding: "56px 0 80px", backgroundColor: "transparent", minHeight: "50vh" }}>
        <div className="section-container">

          {/* Not connected */}
          {!isConnected && (
            <div 
              className="form-card" 
              style={{ 
                margin: "60px auto", 
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
            >
              <div style={{ width: "120px", height: "120px", marginBottom: "16px" }}>
                <Lottie animationData={walletAnim} loop={true} speed={0.8} />
              </div>
              <p className="text-body-lg" style={{ color: "var(--color-ink)", fontWeight: 500 }}>
                Connect your wallet to view your tokens.
              </p>
              <p className="text-caption" style={{ marginTop: "8px", maxWidth: "340px" }}>
                Your token collection will appear here once connected.
              </p>
            </div>
          )}

          {/* Loading */}
          {isConnected && isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <InventorySkeleton key={i} />)}
            </div>
          )}

          {/* Error */}
          {isConnected && !isLoading && error && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p className="text-body-lg" style={{ color: "var(--color-muted)" }}>{error}</p>
            </div>
          )}

          {/* List error banner */}
          {listError && (
            <div
              style={{
                padding: "12px 16px",
                marginBottom: "24px",
                borderRadius: "var(--radius-xs)",
                border: "1px solid rgba(179,0,0,0.2)",
                backgroundColor: "#fff0f0",
                color: "var(--color-error)",
                fontSize: "14px",
              }}
            >
              {listError}
            </div>
          )}

          {/* Empty */}
          {isConnected && !isLoading && !error && ownedTokenIds.length === 0 && (
            <div 
              className="form-card" 
              style={{ 
                margin: "60px auto", 
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "20px" }}>
                <div style={{ width: "80px", height: "80px" }}>
                  <Lottie animationData={removeItemAnim} loop={true} speed={0.8} />
                </div>
                <div style={{ width: "80px", height: "80px" }}>
                  <Lottie animationData={walletAnim} loop={true} speed={0.8} />
                </div>
              </div>
              <p className="text-body-lg" style={{ color: "var(--color-ink)", fontWeight: 500 }}>
                You don't own any tokens yet.
              </p>
              <p className="text-caption" style={{ marginTop: "8px", maxWidth: "340px" }}>
                Head to the Mint tab to create your first regulated access token and start your collection.
              </p>
            </div>
          )}

          {/* Inventory grid */}
          {isConnected && !isLoading && !error && ownedTokenIds.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dashboard-grid">
              {ownedTokenIds.map((token) => (
                <InventoryCard
                  key={token.tokenId}
                  token={token}
                  price={prices[token.tokenId]}
                  onPriceChange={handlePriceChange}
                  onList={listToken}
                  isListing={isListing}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
