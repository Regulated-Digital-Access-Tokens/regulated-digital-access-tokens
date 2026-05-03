/**
 * parseTokenURI
 *
 * Parses a tokenURI string into structured data.
 * Supports two formats:
 *   1. JSON: '{"metadata":"...", "image":"data:image/..."}'
 *   2. Legacy plain text: 'access-level-3' (pre-image era)
 *
 * @param {string} uri - The raw tokenURI string from the contract
 * @returns {{ metadata: string, image: string|null }}
 */
export function parseTokenURI(uri) {
  if (!uri) return { metadata: "", image: null };

  try {
    const parsed = JSON.parse(uri);
    return {
      metadata: parsed.metadata || "",
      image: parsed.image || null,
    };
  } catch {
    // Legacy plain-text URI — treat entire string as metadata
    return {
      metadata: uri,
      image: null,
    };
  }
}
