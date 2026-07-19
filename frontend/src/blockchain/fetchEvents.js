export async function fetchEventsSafely(contract, filter, deploymentBlock) {
  try {
    // Attempt 1: Fetch all events from deployment block
    // This is the ideal case and works on Alchemy/Infura with archive support.
    // If the block range is huge, some RPCs might throw an error.
    return await contract.queryFilter(filter, deploymentBlock);
  } catch (err) {
    console.warn(
      "Full historical event fetch failed (RPC might not support archive requests or range is too large). Falling back to recent blocks.",
      err
    );
    try {
      // Attempt 2: Fetch only the last 9,000 blocks
      // This is a common limit for free RPC nodes without archive access.
      // -9000 ensures we stay well under the strict 10,000 block range limit (inclusive).
      // Note: This means very old tokens/listings won't show up!
      return await contract.queryFilter(filter, -9000);
    } catch (fallbackErr) {
      console.error("Fallback event fetch also failed:", fallbackErr);
      throw fallbackErr; // Let the hook catch it and show the error UI
    }
  }
}
