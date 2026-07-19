import { useState } from "react";
import { useWallet } from "../blockchain/useWallet";
import { useGetOwnedTokens } from "../blockchain/useGetOwnedTokens";
import { useListToken } from "../blockchain/useListToken";
import DecryptedText from "../components/DecryptedText";
import Lottie from "lottie-react";
import removeItemAnim from "../../public/assets/remove-item.json";
import walletAnim from "../../public/assets/wallet.json";
import HexVaultBackground from "../components/HexVaultBackground";
import SplitText from "../components/SplitText";

/* --------------------------------------------------------------------------
   Skeleton inventory card — Caldera
   -------------------------------------------------------------------------- */
function InventorySkeleton() {
  return (
    <div className="product-card" aria-hidden="true">
      <div className="skeleton" style={{ height: "120px", borderRadius: "var(--radius-medium)" }} />
      <div className="skeleton" style={{ height: "16px", width: "50%", borderRadius: "var(--radius-small)" }} />
      <div className="skeleton" style={{ height: "40px", borderRadius: "var(--radius-inputs)" }} />
    </div>
  );
}

/* --------------------------------------------------------------------------
   Single owned-token inventory card — Caldera
   Limestone surface, 40px radius, pill inputs, Ember CTA
   -------------------------------------------------------------------------- */
function InventoryCard({ tokenId, metadata, image, onList, isListing, price, onPriceChange }) {
  return (
    <div
      className="product-card"
      id={`owned-${tokenId}`}
      style={{
        padding: "0",
        overflow: "hidden"
      }}
    >
      {/* Token image or placeholder */}
      <div
        style={{
          height: "180px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: image ? "transparent" : "var(--color-obsidian)",
          overflow: "hidden",
          borderRadius: "var(--radius-cards) var(--radius-cards) 0 0"
        }}
      >
        {image ? (
          <img src={image} alt={`Token ${tokenId}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
            TOKEN #{tokenId}
          </span>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: "var(--spacing-24) var(--spacing-32) var(--spacing-32)", display: "flex", flexDirection: "column", gap: "var(--spacing-20)" }}>
        <div style={{ textAlign: "left" }}>
          {/* Sulfur tag */}
          <span className="chip" style={{ marginBottom: "10px", fontSize: "12px", padding: "3px 8px", display: "inline-block" }}>
            OWNED ASSET
          </span>
          <p className="text-subheading">
            {metadata || `Token #${tokenId}`}
          </p>
          {metadata && (
            <span className="text-micro" style={{ marginTop: "4px", display: "block" }}>
              Token #{tokenId}
            </span>
          )}
        </div>

        {/* Dotted divider */}
        <div style={{ borderTop: "1.5px dotted rgba(7, 6, 7, 0.15)", margin: "0 calc(-1 * var(--spacing-32))" }} />

        {/* List form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-16)" }}>
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
            <p className="text-caption" style={{ marginTop: "8px" }}>
              Set the price for other users to buy this token.
            </p>
          </div>

          <button
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={isListing || !price}
            onClick={() => onList(tokenId, price)}
            id={`list-btn-${tokenId}`}
          >
            {isListing ? "Processing…" : "List on Marketplace"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   DashboardView — Caldera
   Obsidian hero with Ember leaf particles → inventory grid
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
      {/* Hero — Obsidian with Ember leaf particles */}
      <section className="feature-band" style={{ position: "relative" }}>
        <HexVaultBackground theme="dark" />
        <div
          className="section-container"
          style={{ padding: "140px 24px 80px", position: "relative", zIndex: 1, textAlign: "center" }}
        >
          <span className="chip" style={{ marginBottom: "16px", display: "inline-block" }}>
            YOUR COLLECTION
          </span>
          <DecryptedText
            text="My Dashboard"
            className="text-product-display text-chalk"
            style={{ marginBottom: "16px", display: "block", textAlign: "center", width: "100%" }}
            scrambleColor="rgba(252, 80, 0, 0.8)"
          />
          <p className="text-body-lg" style={{ color: "rgba(255,255,255,0.55)", maxWidth: "440px", margin: "0 auto", cursor: "default" }}>
            <SplitText
              text="Manage your regulated access tokens and list them on the marketplace."
              charClassName="char-item"
              animationType="tumble"
            />
          </p>
        </div>
      </section>

      {/* Content section */}
      <section style={{ padding: "var(--spacing-56) 0 var(--spacing-80)", minHeight: "50vh" }}>
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
              <p className="text-heading" style={{ marginBottom: "8px" }}>
                Wallet Required
              </p>
              <p className="text-caption" style={{ marginTop: "8px", maxWidth: "340px" }}>
                Connect your wallet to view your tokens. Your token collection will appear here once connected.
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
              <p className="text-body-lg" style={{ color: "rgba(7, 6, 7, 0.5)" }}>{error}</p>
            </div>
          )}

          {/* List error banner */}
          {listError && (
            <div
              className="status-strip--error"
              style={{ padding: "14px 18px", marginBottom: "24px", fontSize: "var(--text-body-sm)" }}
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
              <p className="text-heading" style={{ marginBottom: "8px" }}>
                No Tokens Yet
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
                  tokenId={token.tokenId}
                  metadata={token.metadata}
                  image={token.image}
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
