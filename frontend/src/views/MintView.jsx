import { useState } from "react";
import { useMintToken } from "../blockchain/useMintToken";
import DecryptedText from "../components/DecryptedText";

/**
 * MintView
 *
 * contact-form-card pattern on a pale-stone section background.
 * Hero copy above the card, form inside the rounded white card.
 */
export default function MintView() {
  const { mintToken, isPromptingWallet, isMining, error, success } = useMintToken();
  const isLoading = isPromptingWallet || isMining;
  const [metadata, setMetadata] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!price) return;
    mintToken(metadata, price);
  };

  return (
    <div>
      {/* Hero — white canvas with centered type */}
      <section
        style={{
          backgroundColor: "transparent",
          padding: "80px 24px 64px",
          textAlign: "center",
        }}
      >
        <div className="section-container" style={{ maxWidth: "600px" }}>
          <DecryptedText
            text="The Genesis Point"
            className="text-product-display"
            style={{ marginBottom: "20px", display: "block", textAlign: "center", width: "100%" }}
          />
          <p className="text-body-lg subhead-hover subhead-hover--light subhead-blur subhead-blur--light" style={{ color: "var(--color-slate)", maxWidth: "420px", margin: "0 auto" }}>
            Create and deploy your access tokens on the Ethereum network.
            Simple, secure, and permanent.
          </p>
        </div>
      </section>

      {/* Form section — stone background, form-card centered */}
      <section
        style={{
          backgroundColor: "transparent",
          padding: "64px 24px 80px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div className="form-card" id="mint-form-container">
          <p
            className="text-feature-heading"
            style={{ marginBottom: "32px", fontWeight: 400 }}
          >
            Mint New Token
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            id="mint-form"
          >
            {/* Metadata input */}
            <div>
              <label className="form-label" htmlFor="metadata-input">
                Metadata
                <span
                  className="text-caption"
                  style={{ marginLeft: "8px", fontWeight: 400 }}
                >
                  (optional)
                </span>
              </label>
              <input
                className="form-input"
                id="metadata-input"
                type="text"
                placeholder="e.g. access-level-3, vip-pass-2024"
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
              />
              <p className="text-caption" style={{ marginTop: "6px" }}>
                Attach an optional metadata string to your token for on-chain identification.
              </p>
            </div>

            {/* Price input */}
            <div>
              <label className="form-label" htmlFor="price-input">
                Initial Price (ETH)
              </label>
              <input
                className="form-input"
                id="price-input"
                type="number"
                step="0.0001"
                min="0.0001"
                required
                placeholder="e.g. 0.05"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <p className="text-caption" style={{ marginTop: "6px" }}>
                Set the initial price for minting your token.
              </p>
            </div>

            {/* Error display */}
            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid rgba(179,0,0,0.2)",
                  backgroundColor: "#fff0f0",
                  color: "var(--color-error)",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            {/* Success display */}
            {success && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid rgba(0,179,0,0.2)",
                  backgroundColor: "#f0fff0",
                  color: "green",
                  fontSize: "14px",
                }}
              >
                Token minted successfully!
              </div>
            )}

            {/* Submit — primary pill CTA */}
            <button
              className="btn-primary"
              type="submit"
              disabled={isLoading}
              id="mint-btn"
              style={{ alignSelf: "flex-start", marginTop: "8px" }}
            >
              {isLoading ? "Processing…" : "Mint New Token"}
            </button>
          </form>
        </div>
      </section>

      {/* Capability band — informational, dark-feature-band style */}
      <section className="feature-band" style={{ padding: "56px 0" }}>
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                label: "ON-CHAIN",
                title: "Permanent Record",
                body: "Every token is immutably recorded on the Ethereum blockchain.",
              },
              {
                label: "REGULATED",
                title: "Compliant Access",
                body: "Tokens carry embedded compliance metadata for regulated environments.",
              },
              {
                label: "TRANSFERABLE",
                title: "Full Ownership",
                body: "ERC-721 standard ensures your tokens are fully transferable and tradeable.",
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.2)",
                  paddingTop: "24px",
                }}
              >
                <span
                  className="text-mono-label"
                  style={{ color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "10px" }}
                >
                  {item.label}
                </span>
                <p
                  className="text-feature-heading text-white"
                  style={{ marginBottom: "10px" }}
                >
                  {item.title}
                </p>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
