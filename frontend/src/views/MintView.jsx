import { useState } from "react";
import { useMintToken } from "../blockchain/useMintToken";

/**
 * MintView
 *
 * A simple form with an optional metadata input and a Mint button.
 * The mint action is wired into the useMintToken hook with proper
 * async loading states.
 */
export default function MintView() {
  const { mint, isLoading, error } = useMintToken();
  const [metadata, setMetadata] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    mint(metadata);
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md" id="mint-form">
        <label htmlFor="metadata-input">Metadata (optional)</label>
        <input
          id="metadata-input"
          type="text"
          placeholder="e.g. access-level-3"
          value={metadata}
          onChange={(e) => setMetadata(e.target.value)}
        />

        {error && <p>{error}</p>}

        <button type="submit" disabled={isLoading} id="mint-btn">
          {isLoading ? "Processing..." : "Mint Token"}
        </button>
      </form>
    </div>
  );
}
