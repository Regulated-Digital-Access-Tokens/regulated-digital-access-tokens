/**
 * errorHandler.js
 *
 * Centralized utility for handling Web3 errors.
 * Parses Ethers.js errors, RPC errors, and Solidity revert reasons
 * into human-readable strings for the UI.
 */
export function parseTransactionError(err) {
  // 1. User rejected the transaction in MetaMask
  if (err.code === "ACTION_REJECTED") {
    return "Transaction cancelled by user.";
  }

  // 2. Insufficient funds for gas or value
  if (err.code === "INSUFFICIENT_FUNDS") {
    return "Insufficient ETH to complete this transaction.";
  }

  // 3. Ethers v6 contract revert parsing
  // Ethers usually attaches the revert reason to the error object.
  const reason = err.reason || err.shortMessage || err.message;

  if (reason) {
    if (reason.includes("Exceeds max resale markup")) {
      return "Price exceeds the maximum 110% resale markup limit.";
    }
    if (reason.includes("Token not listed")) {
      return "This token is not currently listed for sale.";
    }
    if (reason.includes("Incorrect payment amount") || reason.includes("Incorrect mint payment")) {
      return "The exact ETH amount was not sent.";
    }
    if (reason.includes("Not token owner") || reason.includes("Not listing seller")) {
      return "You do not have permission to perform this action.";
    }
    
    // Fallback for other specific revert strings
    const match = reason.match(/reverted with reason string '([^']+)'/);
    if (match && match[1]) {
      return match[1];
    }
  }

  // 4. Ultimate fallback
  console.error("Unhandled Web3 Error:", err);
  return "An unexpected blockchain error occurred. Please try again.";
}
