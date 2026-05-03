import { useContext } from "react";
import { WalletContext } from "./WalletContext";

/**
 * useWallet
 *
 * The single hook the Frontend Visionary uses to access all wallet state.
 * Must be called from a component that is a descendant of <WalletProvider>.
 *
 * Usage in any component:
 *   const {
 *     address,
 *     isConnected,
 *     isConnecting,
 *     isCorrectNetwork,
 *     chainId,
 *     error,
 *     connectWallet,
 *     disconnectWallet,
 *   } = useWallet();
 *
 * Handoff note for the Frontend Visionary:
 *   - Show a "Connect Wallet" button if `!isConnected`.
 *   - Disable it and show a spinner if `isConnecting` is true.
 *   - Show a "Wrong Network" banner if `isConnected && !isCorrectNetwork`.
 *   - Display `address` in the header once connected.
 *   - Display `error` in a toast or alert if it is non-null.
 */
export function useWallet() {
  const context = useContext(WalletContext);

  if (context === null) {
    throw new Error(
      "useWallet() must be used inside a <WalletProvider>. " +
      "Wrap your <App /> with <WalletProvider> in main.jsx."
    );
  }

  return context;
}
