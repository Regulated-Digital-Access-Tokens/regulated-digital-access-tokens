import { useState } from "react";
import { useWallet } from "../blockchain/useWallet";
import { useGetOwnedTokens } from "../blockchain/useGetOwnedTokens";
import { useListToken } from "../blockchain/useListToken";
import DecryptedText from "../components/DecryptedText";

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
function InventoryCard({ tokenId, onList, isListing, price, onPriceChange }) {
  return (
    <div className="product-card" id={`owned-${tokenId}`}>
      {/* Token identifier band */}
      <div
        style={{
          backgroundColor: "rgba(0,60,51,0.07)",
          borderRadius: "var(--radius-xs)",
          padding: "20px 16px",
          textAlign: "center",
        }}
      >
        <span className="text-mono-label" style={{ color: "var(--color-green)", fontSize: "12px" }}>
          OWNED
        </span>
        <p
          className="text-feature-heading"
          style={{ marginTop: "4px", fontWeight: 500, color: "var(--color-near-black)" }}
        >
          Token #{tokenId}
        </p>
      </div>

      {/* Divider */}
      <div className="product-card__divider" />

      {/* List form */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label className="form-label" htmlFor={`price-input-${tokenId}`}>
          Set listing price (ETH)
        </label>
        <input
          className="form-input"
          id={`price-input-${tokenId}`}
          type="number"
          min="0"
          step="0.001"
          placeholder="0.00"
          value={price || ""}
          onChange={(e) => onPriceChange(tokenId, e.target.value)}
        />
        <button
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center" }}
          disabled={isListing || !price}
          onClick={() => onList(tokenId, price)}
          id={`list-btn-${tokenId}`}
        >
          {isListing ? "Processing…" : "List on Market"}
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
        <div
          className="section-container"
          style={{ padding: "64px 24px", textAlign: "center" }}
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
          <p className="text-body-lg subhead-hover subhead-hover--dark subhead-blur subhead-blur--dark" style={{ color: "rgba(255,255,255,0.65)", maxWidth: "440px", margin: "0 auto" }}>
            Manage your regulated access tokens and list them on the marketplace.
          </p>
        </div>
      </section>

      {/* Content section */}
      <section style={{ padding: "56px 0 80px", backgroundColor: "transparent" }}>
        <div className="section-container">

          {/* Not connected */}
          {!isConnected && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p className="text-body-lg" style={{ color: "var(--color-muted)", marginBottom: "8px" }}>
                Connect your wallet to view your tokens.
              </p>
              <p className="text-caption">
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
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p className="text-body-lg" style={{ color: "var(--color-muted)" }}>
                You don't own any tokens yet.
              </p>
              <p className="text-caption" style={{ marginTop: "8px" }}>
                Head to the Mint tab to create your first token.
              </p>
            </div>
          )}

          {/* Inventory grid */}
          {isConnected && !isLoading && !error && ownedTokenIds.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dashboard-grid">
              {ownedTokenIds.map((token) => (
                <InventoryCard
                  key={token.tokenId}
                  tokenId={token.tokenId}
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
