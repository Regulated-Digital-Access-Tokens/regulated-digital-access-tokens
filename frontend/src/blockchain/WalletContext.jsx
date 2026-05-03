import { createContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

// ---------------------------------------------------------------------------
// Supported networks. Add more EVM chain IDs here if needed later.
// ---------------------------------------------------------------------------
const SUPPORTED_CHAIN_IDS = {
  31337: "Hardhat Local",
  11155111: "Sepolia Testnet",
};

// ---------------------------------------------------------------------------
// Context shape — exported so useWallet.js can read the default value type.
// ---------------------------------------------------------------------------
export const WalletContext = createContext(null);

// ---------------------------------------------------------------------------
// WalletProvider
// Wrap your <App /> with this once the Frontend Visionary sets up main.jsx:
//   <WalletProvider>
//     <App />
//   </WalletProvider>
// ---------------------------------------------------------------------------
export function WalletProvider({ children }) {
  const [provider, setProvider]           = useState(null);  // ethers.BrowserProvider
  const [signer, setSigner]               = useState(null);  // ethers.JsonRpcSigner
  const [address, setAddress]             = useState(null);  // "0x..." string
  const [chainId, setChainId]             = useState(null);  // number
  const [isConnecting, setIsConnecting]   = useState(false); // true while MetaMask is opening
  const [isConnected, setIsConnected]     = useState(false); // true after successful connection
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [error, setError]                 = useState(null);  // human-readable error string

  // -------------------------------------------------------------------------
  // Internal helper: derive and store all state from a live BrowserProvider.
  // Called both on initial connect and when accounts/chain change.
  // -------------------------------------------------------------------------
  const _syncState = useCallback(async (browserProvider) => {
    try {
      const _signer  = await browserProvider.getSigner();
      const _address = await _signer.getAddress();
      const network  = await browserProvider.getNetwork();
      const _chainId = Number(network.chainId); // BigInt → number

      setProvider(browserProvider);
      setSigner(_signer);
      setAddress(_address);
      setChainId(_chainId);
      setIsConnected(true);
      setIsCorrectNetwork(_chainId in SUPPORTED_CHAIN_IDS);
      setError(null);
    } catch (err) {
      // getSigner() can throw if MetaMask is locked mid-session
      _resetState();
      setError("Failed to sync wallet state. Please reconnect.");
    }
  }, []);

  // -------------------------------------------------------------------------
  // Internal helper: clear all wallet state on disconnect or error.
  // -------------------------------------------------------------------------
  const _resetState = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
    setIsConnected(false);
    setIsCorrectNetwork(false);
  }, []);

  // -------------------------------------------------------------------------
  // connectWallet
  // Called by the UI's "Connect Wallet" button.
  // -------------------------------------------------------------------------
  const connectWallet = useCallback(async () => {
    setError(null);

    // Guard: MetaMask (or any EIP-1193 provider) must be injected.
    if (!window.ethereum) {
      setError("No wallet detected. Please install MetaMask.");
      return;
    }

    setIsConnecting(true);
    try {
      // Prompt MetaMask to show the account selection popup.
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      await _syncState(browserProvider);
    } catch (err) {
      // User clicked "Cancel" in MetaMask, or another error occurred.
      if (err.code === 4001) {
        setError("Connection rejected. Please approve the MetaMask request.");
      } else {
        setError("Failed to connect wallet. Please try again.");
      }
      _resetState();
    } finally {
      setIsConnecting(false);
    }
  }, [_syncState, _resetState]);

  // -------------------------------------------------------------------------
  // disconnectWallet
  // Note: EIP-1193 doesn't have a true "disconnect" — we only clear local state.
  // The user must disconnect from inside MetaMask to fully revoke access.
  // -------------------------------------------------------------------------
  const disconnectWallet = useCallback(() => {
    _resetState();
    setError(null);
  }, [_resetState]);

  // -------------------------------------------------------------------------
  // Event Listeners
  // Set up once on mount. Clean up on unmount to prevent memory leaks.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!window.ethereum) return;

    // Fired when the user switches accounts inside MetaMask.
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        // User disconnected all accounts from MetaMask.
        _resetState();
        setError("Wallet disconnected.");
      } else {
        // User switched to a different account — re-sync everything.
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        await _syncState(browserProvider);
      }
    };

    // Fired when the user switches networks inside MetaMask.
    const handleChainChanged = async () => {
      // Ethers.js recommends a full provider refresh on chain change.
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      await _syncState(browserProvider);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    // Cleanup: remove listeners when the provider unmounts.
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [_syncState, _resetState]);

  // -------------------------------------------------------------------------
  // Context value — everything the rest of the app can consume via useWallet()
  // -------------------------------------------------------------------------
  const contextValue = {
    // State
    provider,           // ethers.BrowserProvider | null
    signer,             // ethers.JsonRpcSigner | null
    address,            // "0x..." | null
    chainId,            // number | null
    isConnected,        // boolean
    isConnecting,       // boolean — true while MetaMask popup is open
    isCorrectNetwork,   // boolean — false if user is on an unsupported chain
    error,              // string | null — human-readable error message
    supportedNetworks: SUPPORTED_CHAIN_IDS, // expose for the UI to show network names
    // Actions
    connectWallet,
    disconnectWallet,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}
