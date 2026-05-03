import { useState } from "react";
import { useWallet } from "./blockchain/useWallet";
import MarketplaceView from "./views/MarketplaceView";
import DashboardView from "./views/DashboardView";
import MintView from "./views/MintView";
import TransactionToast from "./components/TransactionToast";
import DotMatrixBackground from "./components/DotMatrixBackground";

const TABS = [
  { key: "marketplace", label: "Marketplace" },
  { key: "dashboard",   label: "Dashboard"   },
  { key: "mint",        label: "Mint"         },
];

/**
 * App
 *
 * Root shell with DESIGN.md-compliant three-zone navbar:
 *   Logo left — Tab nav centered — Wallet CTA right
 *
 * Uses `nav-tab` active-underline pattern from the design system.
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

  /** Truncate 0x... to 0x1234…abcd */
  const truncateAddress = (addr) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  return (
    <div className="flex flex-col min-h-screen" id="app-root" style={{ backgroundColor: "transparent" }}>
      <DotMatrixBackground />

      {/* ------------------------------------------------------------------ */}
      {/* Navbar — three-zone layout, 1px bottom hairline                     */}
      {/* ------------------------------------------------------------------ */}
      <header style={{ borderBottom: "1px solid var(--color-hairline)", backgroundColor: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 50 }}>
        <nav
          className="section-container flex items-center justify-between"
          style={{ height: "64px" }}
          id="navbar"
        >
          {/* Zone 1 — Logo / Brand */}
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              fontWeight: 800,
              color: "var(--color-near-black)",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
            id="app-title"
          >
            Regulated Access Tokens
          </span>

          {/* Zone 2 — Tab Navigation */}
          <div className="flex items-center gap-8" id="tab-nav">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`nav-tab ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
                aria-current={activeTab === tab.key ? "page" : undefined}
                id={`tab-${tab.key}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Zone 3 — Wallet CTA */}
          <div id="wallet-area">
            {walletError && (
              <span
                className="text-caption mr-3"
                style={{ color: "var(--color-error)" }}
              >
                {walletError}
              </span>
            )}

            {isConnected ? (
              <span className="wallet-chip" id="wallet-address">
                {/* Small dot indicator */}
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "9999px",
                    backgroundColor: "#22c55e",
                    flexShrink: 0,
                  }}
                />
                {truncateAddress(address)}
              </span>
            ) : (
              <button
                className="btn-primary"
                onClick={connectWallet}
                disabled={isConnecting}
                id="connect-wallet-btn"
              >
                {isConnecting ? "Connecting…" : "Connect Wallet"}
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Active View                                                          */}
      {/* ------------------------------------------------------------------ */}
      <main className="flex-1" id="main-content">
        {activeTab === "marketplace" && <MarketplaceView />}
        {activeTab === "dashboard"   && <DashboardView />}
        {activeTab === "mint"        && <MintView />}
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Footer — dark near-black, column layout                             */}
      {/* ------------------------------------------------------------------ */}
      <footer
        style={{
          backgroundColor: "var(--color-near-black)",
          color: "var(--color-white)",
          padding: "56px 0 40px",
        }}
      >
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10"
               style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div>
              <p style={{
                fontFamily: "var(--font-display)",
                fontSize: "16px",
                fontWeight: 800,
                color: "var(--color-white)",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}>
                Regulated Access Tokens
              </p>
              <p className="text-micro">
                © 2024 RAT. Built on Ethereum.
              </p>
            </div>
            <div>
              <p className="footer-col-heading">Legal</p>
              <button className="footer-link">Terms</button>
              <button className="footer-link">Privacy</button>
            </div>
            <div>
              <p className="footer-col-heading">Resources</p>
              <button className="footer-link">Support</button>
              <button className="footer-link">Docs</button>
            </div>
            <div>
              <p className="footer-col-heading">Community</p>
              <button className="footer-link">Twitter</button>
              <button className="footer-link">Discord</button>
            </div>
          </div>
        </div>
      </footer>

      {/* ------------------------------------------------------------------ */}
      {/* Global Transaction Toast                                            */}
      {/* ------------------------------------------------------------------ */}
      <TransactionToast />
    </div>
  );
}
