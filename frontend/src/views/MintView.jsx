import { useState, useRef, useCallback } from "react";
import { useMintToken } from "../blockchain/useMintToken";
import DecryptedText from "../components/DecryptedText";
import ForgeEmbersBackground from "../components/ForgeEmbersBackground";
import SplitText from "../components/SplitText";
import { compressImage } from "../utils/compressImage";

/**
 * MintView — Caldera Edition
 *
 * Ember hero with wave background.
 * Limestone form card on Pumice canvas.
 * Obsidian capability band with Ember accents.
 */
export default function MintView() {
  const { mintToken, isPromptingWallet, isMining, error, success } = useMintToken();
  const isLoading = isPromptingWallet || isMining;
  const [metadata, setMetadata] = useState("");
  const [price, setPrice] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  /** Process an image file — compress if needed, set preview */
  const processImageFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    setIsCompressing(true);
    try {
      const compressed = await compressImage(file, 1024);
      setImagePreview(compressed);
    } catch (err) {
      console.error("Image compression failed:", err);
    } finally {
      setIsCompressing(false);
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!price) return;

    const tokenData = { metadata: metadata || "" };
    if (imagePreview) {
      tokenData.image = imagePreview;
    }
    const tokenURI = JSON.stringify(tokenData);

    mintToken(tokenURI, price);
  };

  return (
    <div>
      {/* Hero — Ember background with wave animation */}
      <section
        className="feature-band feature-band--ember"
        style={{ backgroundColor: "var(--color-ember)" }}
      >
        <ForgeEmbersBackground />
        <div
          className="section-container"
          style={{
            maxWidth: "700px",
            padding: "140px 24px 80px",
            position: "relative",
            zIndex: 1,
            textAlign: "center"
          }}
        >
          <DecryptedText
            text="The Genesis Point"
            className="text-product-display"
            style={{
              marginBottom: "20px",
              display: "block",
              textAlign: "center",
              width: "100%",
              color: "var(--color-obsidian)"
            }}
            scrambleColor="rgba(7, 6, 7, 0.4)"
          />
          <p
            className="text-body-lg"
            style={{
              color: "rgba(7, 6, 7, 0.6)",
              maxWidth: "480px",
              margin: "0 auto",
              textAlign: "center",
              cursor: "default"
            }}
          >
            <SplitText
              text="Create and deploy your access tokens on the Ethereum network. Simple, secure, and permanent."
              charClassName="char-item"
              animationType="wavy"
            />
          </p>
        </div>
      </section>

      {/* Dotted separator */}
      <div className="divider" />

      {/* Form section — Pumice canvas, Limestone form card */}
      <section
        style={{
          padding: "var(--spacing-64) 24px var(--spacing-80)",
          display: "flex",
          justifyContent: "center",
          minHeight: "50vh"
        }}
      >
        <div className="form-card" id="mint-form-container">
          <p className="text-heading-lg" style={{ marginBottom: "var(--spacing-32)" }}>
            Mint New Token
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-24)" }}
            id="mint-form"
          >
            {/* Metadata input */}
            <div>
              <label className="form-label" htmlFor="metadata-input">
                Metadata
                <span className="text-caption" style={{ marginLeft: "8px" }}>
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
              <p className="text-caption" style={{ marginTop: "8px" }}>
                Attach an optional metadata string to your token for on-chain identification.
              </p>
            </div>

            {/* Image upload */}
            <div>
              <label className="form-label">
                Token Image
                <span className="text-caption" style={{ marginLeft: "8px" }}>
                  (optional)
                </span>
              </label>

              {!imagePreview ? (
                <div
                  className={`image-upload-zone ${dragActive ? "image-upload-zone--active" : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  id="image-upload-zone"
                >
                  {isCompressing ? (
                    <div style={{ textAlign: "center" }}>
                      <div className="text-caption" style={{ color: "rgba(7, 6, 7, 0.5)" }}>
                        Compressing image…
                      </div>
                    </div>
                  ) : (
                    <>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(7, 6, 7, 0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <p className="text-caption" style={{ marginTop: "10px" }}>
                        Drag & drop an image, or <span style={{ color: "var(--color-ember)", cursor: "pointer", fontWeight: 500 }}>browse</span>
                      </p>
                      <p className="text-micro" style={{ marginTop: "4px" }}>
                        Image will be compressed to a small thumbnail for on-chain storage
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="image-preview-container">
                  <img
                    src={imagePreview}
                    alt="Token preview"
                    className="image-preview-thumb"
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="text-body-sm" style={{ color: "var(--color-obsidian)" }}>
                      Image attached
                    </p>
                    <p className="text-micro" style={{ marginTop: "2px" }}>
                      {Math.round((imagePreview.length - imagePreview.indexOf(",") - 1) * 0.75 / 1024)}KB compressed
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="image-remove-btn"
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
                id="image-file-input"
              />
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
              <p className="text-caption" style={{ marginTop: "8px" }}>
                Set the initial price for minting your token.
              </p>
            </div>

            {/* Error display */}
            {error && (
              <div
                className="status-strip--error"
                style={{ padding: "14px 18px", fontSize: "var(--text-body-sm)" }}
              >
                {error}
              </div>
            )}

            {/* Success display */}
            {success && (
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: "var(--radius-small)",
                  border: "1.5px solid rgba(45, 125, 70, 0.2)",
                  backgroundColor: "rgba(45, 125, 70, 0.06)",
                  color: "var(--color-success)",
                  fontSize: "var(--text-body-sm)",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                Token minted successfully!
              </div>
            )}

            {/* Submit — Ember pill CTA */}
            <button
              className="btn-primary"
              type="submit"
              disabled={isLoading || isCompressing}
              id="mint-btn"
              style={{ alignSelf: "flex-start", marginTop: "var(--spacing-8)" }}
            >
              {isLoading ? "Processing…" : "Mint New Token"}
            </button>
          </form>
        </div>
      </section>

      {/* Capability band — Obsidian with Ember accents */}
      <section className="feature-band" style={{ padding: "var(--spacing-64) 0", minHeight: "auto" }}>
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
                  borderTop: "2px solid var(--color-ember)",
                  paddingTop: "var(--spacing-24)",
                }}
              >
                <span
                  className="chip"
                  style={{
                    display: "inline-block",
                    marginBottom: "var(--spacing-12)",
                    fontSize: "12px",
                    padding: "3px 8px"
                  }}
                >
                  {item.label}
                </span>
                <p className="text-subheading text-chalk" style={{ marginBottom: "var(--spacing-10)" }}>
                  {item.title}
                </p>
                <p style={{ fontSize: "var(--text-body-sm)", color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>
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