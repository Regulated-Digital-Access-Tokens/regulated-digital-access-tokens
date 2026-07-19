import { useState, useEffect, useRef, useCallback } from "react";
import { useWallet } from "./blockchain/useWallet";
import MarketplaceView from "./views/MarketplaceView";
import DashboardView from "./views/DashboardView";
import MintView from "./views/MintView";
import TransactionToast from "./components/TransactionToast";

const TABS = [
  { key: "marketplace", label: "Marketplace" },
  { key: "dashboard",   label: "Dashboard"   },
  { key: "mint",        label: "Mint"         },
];

const FADE_OUT_MS = 300;
const FADE_IN_MS = 400;

/**
 * Whether the hero section for a given tab has a dark background,
 * requiring light (Chalk) navbar text when not scrolled.
 */
const TAB_HERO_IS_DARK = {
  marketplace: true,   // Obsidian hero
  dashboard:   true,   // Obsidian hero
  mint:        false,  // Ember hero — dark text works
};

/**
 * App — Caldera Shell
 *
 * Pumice canvas, Limestone pill navbar, Ember CTA,
 * Obsidian footer. Flat, shadowless, volcanic.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState("marketplace");
  const [displayedTab, setDisplayedTab] = useState("marketplace");
  const [transitionPhase, setTransitionPhase] = useState("idle");
  const pendingTabRef = useRef(null);

  const {
    address,
    isConnected,
    isConnecting,
    connectWallet,
    error: walletError,
  } = useWallet();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /**
   * Two-phase tab switch with crossfade
   */
  const handleTabSwitch = useCallback((newTab) => {
    if (newTab === activeTab || transitionPhase !== "idle") return;

    pendingTabRef.current = newTab;
    setActiveTab(newTab);
    setTransitionPhase("leaving");

    setTimeout(() => {
      setDisplayedTab(newTab);
      window.scrollTo({ top: 0, behavior: "instant" });
      setTransitionPhase("entering");

      setTimeout(() => {
        setTransitionPhase("idle");
        pendingTabRef.current = null;
      }, FADE_IN_MS);
    }, FADE_OUT_MS);
  }, [activeTab, transitionPhase]);

  /** Truncate 0x... to 0x1234…abcd */
  const truncateAddress = (addr) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  /**
   * Navbar theming: adapt text color based on hero background.
   * When not scrolled AND hero is dark → use Chalk text.
   * When scrolled → always Obsidian text (on Limestone capsule).
   */
  const heroDark = TAB_HERO_IS_DARK[activeTab];
  const useLight = !isScrolled && heroDark;
  const navTextColor = useLight ? "var(--color-chalk)" : "var(--color-obsidian)";
  const navMutedColor = useLight ? "rgba(255,255,255,0.55)" : "rgba(7, 6, 7, 0.5)";

  /** Compute transition styles */
  const getContentStyle = () => {
    if (transitionPhase === "leaving") {
      return {
        opacity: 0,
        transform: "translateY(24px)",
        transition: `opacity ${FADE_OUT_MS}ms ease-out, transform ${FADE_OUT_MS}ms ease-out`,
      };
    }
    if (transitionPhase === "entering") {
      return {
        opacity: 1,
        transform: "translateY(0)",
        transition: `opacity ${FADE_IN_MS}ms ease-out, transform ${FADE_IN_MS}ms ease-out`,
      };
    }
    return {
      opacity: 1,
      transform: "translateY(0)",
    };
  };

  return (
    <div className="flex flex-col min-h-screen" id="app-root" style={{ backgroundColor: "var(--color-pumice)" }}>

      {/* ------------------------------------------------------------------ */}
      {/* Navbar — Caldera Limestone pill, Ember CTA                         */}
      {/* ------------------------------------------------------------------ */}
      <header
        className={isScrolled ? "nav-capsule-mode" : ""}
        style={{
          backgroundColor: "transparent",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 50,
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          padding: isScrolled ? "16px 0" : "0",
          borderBottom: "none"
        }}
      >
        <nav
          className={`section-container flex items-center justify-between ${isScrolled ? "nav-capsule" : ""}`}
          style={{
            height: isScrolled ? "52px" : "64px",
            transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }}
          id="navbar"
        >
          {/* Zone 1 — Logo / Brand */}
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: isScrolled ? "16px" : "22px",
              fontWeight: "var(--font-weight-regular)",
              color: navTextColor,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              opacity: isScrolled ? 0 : 1,
              transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              display: isScrolled ? "none" : "block",
              whiteSpace: "nowrap",
            }}
            id="app-title"
          >
            Regulated Access Tokens
          </span>

          {/* Zone 2 — Tab Navigation */}
          <div
            className="flex items-center"
            id="tab-nav"
            style={{
              gap: isScrolled ? "4px" : "var(--spacing-9)",
              transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`nav-tab ${activeTab === tab.key ? "active" : ""} ${useLight ? "nav-tab--light" : ""}`}
                onClick={() => handleTabSwitch(tab.key)}
                aria-current={activeTab === tab.key ? "page" : undefined}
                id={`tab-${tab.key}`}
                style={{
                  fontSize: isScrolled ? "14px" : "var(--text-body)",
                  padding: isScrolled ? "6px 10px" : "8px 12px",
                  color: activeTab === tab.key ? navTextColor : navMutedColor,
                  transition: "color 0.3s ease, font-size 0.5s ease, padding 0.5s ease"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Zone 3 — Wallet CTA */}
          <div id="wallet-area" style={{ transition: "all 0.5s ease" }}>
            {isConnected ? (
              <span
                className="wallet-chip"
                id="wallet-address"
                style={{
                  transform: isScrolled ? "scale(0.92)" : "scale(1)",
                  backgroundColor: useLight ? "rgba(255,255,255,0.12)" : "var(--color-limestone)",
                  color: useLight ? "var(--color-chalk)" : "var(--color-obsidian)",
                  borderColor: useLight ? "rgba(255,255,255,0.2)" : "transparent",
                  transition: "all 0.3s ease"
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "9999px",
                    backgroundColor: "#22c55e",
                    flexShrink: 0,
                  }}
                />
                {truncateAddress(address)}
              </span>
            ) : (
              <button
                className={`btn-primary ${useLight ? "btn-primary--light" : ""}`}
                onClick={connectWallet}
                disabled={isConnecting}
                style={{
                  padding: isScrolled ? "8px 16px" : "12px 24px",
                  fontSize: isScrolled ? "13px" : "var(--text-body-sm)",
                }}
                id="connect-wallet-btn"
              >
                {isConnecting ? "Connecting…" : "Connect Wallet"}
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Transition wrapper                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div style={getContentStyle()}>
        {/* Active View */}
        <main className="flex-1" id="main-content">
          {displayedTab === "marketplace" && <MarketplaceView />}
          {displayedTab === "dashboard"   && <DashboardView />}
          {displayedTab === "mint"        && <MintView />}
        </main>

        {/* Footer — Obsidian, Caldera type */}
        <footer
          style={{
            backgroundColor: "var(--color-obsidian)",
            color: "var(--color-chalk)",
            padding: "64px 0 48px",
          }}
        >
          <div className="section-container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12"
                 style={{ borderBottom: "1.5px dotted rgba(255,255,255,0.1)" }}>
              <div className="col-span-1 md:col-span-2">
                <p style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "32px",
                  fontWeight: "var(--font-weight-regular)",
                  color: "var(--color-chalk)",
                  marginBottom: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                }}>
                  Regulated Access Tokens
                </p>
                <p className="text-body" style={{ color: "rgba(255,255,255,0.45)", maxWidth: "360px", lineHeight: "1.55" }}>
                  A decentralized platform for secure, compliant, and transparent digital access management on the Ethereum network.
                </p>
              </div>

              <div>
                <p className="footer-col-heading">Course Project</p>
                <p className="text-micro" style={{ color: "rgba(255,255,255,0.35)", lineHeight: "1.8" }}>
                  Blockchain Technology Course<br />
                  Academic Year 2025-2026
                </p>
              </div>

              <div>
                <p className="footer-col-heading">The Team</p>
                <div className="flex flex-col gap-2">
                  <a href="https://github.com/RickyTheDude" target="_blank" rel="noopener noreferrer" className="footer-link" style={{ marginBottom: 0 }}>Ayan</a>
                  <a href="https://github.com/Viv921" target="_blank" rel="noopener noreferrer" className="footer-link" style={{ marginBottom: 0 }}>Vivek</a>
                  <a href="https://github.com/IshanChad" target="_blank" rel="noopener noreferrer" className="footer-link" style={{ marginBottom: 0 }}>Ishan</a>
                </div>
              </div>
            </div>

            <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-micro" style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                © 2026 Regulated Access Tokens. All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-micro" style={{ color: "rgba(255,255,255,0.4)" }}>
                <span>Made with</span>
                <span style={{ color: "var(--color-ember)", fontSize: "14px" }}>♥</span>
                <span>by Ayan, Vivek and Ishan</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Transaction Toast */}
      <TransactionToast />
    </div>
  );
}
