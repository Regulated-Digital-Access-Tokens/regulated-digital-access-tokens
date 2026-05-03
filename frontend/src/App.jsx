import { useState } from "react";
import { useWallet } from "./blockchain/useWallet";
import MarketplaceView from "./views/MarketplaceView";
import DashboardView from "./views/DashboardView";
import MintView from "./views/MintView";
import TransactionToast from "./components/TransactionToast";

const TABS = [
  { key: "marketplace", label: "Marketplace" },
  { key: "dashboard", label: "Dashboard" },
  { key: "mint", label: "Mint" },
];

/**
 * App
 *
 * Root shell component implementing tab-based navigation.
 * Must be rendered inside <WalletProvider> and <TransactionProvider>.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState("marketplace");
  const {
    address,
    isConnected,
    isConnecting,
    connectWallet,
    error: walletError,
  } = useWallet();

  /** Truncate a 0x... address to 0x1234…abcd */
  const truncateAddress = (addr) =>
    `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  return (
    <div className="flex flex-col min-h-screen" id="app-root">
      {/* ---- Navbar ---- */}
      <nav className="flex items-center justify-between p-4" id="navbar">
        <h1 id="app-title">Regulated Access Tokens</h1>

        <div className="flex gap-2" id="tab-nav">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              aria-current={activeTab === tab.key ? "page" : undefined}
              id={`tab-${tab.key}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div id="wallet-area">
          {walletError && <span className="mr-2">{walletError}</span>}

          {isConnected ? (
            <span id="wallet-address">{truncateAddress(address)}</span>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              id="connect-wallet-btn"
            >
              {isConnecting ? "Connecting…" : "Connect Wallet"}
            </button>
          )}
        </div>
      </nav>

      {/* ---- Active View ---- */}
      <main className="flex-1">
        {activeTab === "marketplace" && <MarketplaceView />}
        {activeTab === "dashboard" && <DashboardView />}
        {activeTab === "mint" && <MintView />}
      </main>

      {/* ---- Global Transaction Toast ---- */}
      <TransactionToast />
    </div>
  );
}
