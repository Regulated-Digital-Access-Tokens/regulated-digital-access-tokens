import { useState, useEffect, useRef, useCallback } from "react";
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

const FADE_OUT_MS = 300;
const FADE_IN_MS = 400;

/**
 * App
 *
 * Root shell with two-phase page transition:
 *   Phase 1: Fade out + slide down current view (300ms)
 *   Phase 2: Swap content, scroll to top, fade in + slide up (400ms)
 *
 * Navbar theme adapts to the *incoming* page during the crossover.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState("marketplace");
  const [displayedTab, setDisplayedTab] = useState("marketplace");
  const [transitionPhase, setTransitionPhase] = useState("idle"); // "idle" | "leaving" | "entering"
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
   * Two-phase tab switch:
   *   1. "leaving" — current view fades out (FADE_OUT_MS)
   *   2. Swap content, scroll to top
   *   3. "entering" — new view fades in (FADE_IN_MS)
   *   4. Back to "idle"
   */
  const handleTabSwitch = useCallback((newTab) => {
    if (newTab === activeTab || transitionPhase !== "idle") return;

    pendingTabRef.current = newTab;
    // Update activeTab immediately so navbar theme adapts to the INCOMING page
    setActiveTab(newTab);
    setTransitionPhase("leaving");

    setTimeout(() => {
      // Phase 2: swap the actually displayed view, scroll to top
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
   * Determine navbar theme based on scroll state and active tab.
   * Dashboard and Mint have dark backgrounds, so they need light text in initial mode.
   */
  const isDarkTheme = !isScrolled && (activeTab === "dashboard" || activeTab === "mint");
  const navTextColor = isDarkTheme ? "var(--color-white)" : "var(--color-near-black)";
  const navMutedColor = isDarkTheme ? "rgba(255, 255, 255, 0.7)" : "var(--color-slate)";

  /** Compute transition styles for the main content + footer wrapper */
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
    // idle — fully visible, no transition (avoid stale transitions)
    return {
      opacity: 1,
      transform: "translateY(0)",
    };
  };

  return (
    <div className="flex flex-col min-h-screen" id="app-root" style={{ backgroundColor: "transparent" }}>
      <DotMatrixBackground />

      {/* ------------------------------------------------------------------ */}
      {/* Navbar — transforms into a floating capsule on scroll              */}
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
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          padding: isScrolled ? "20px 0" : "0",
          borderBottom: "none"
        }}
      >
        <nav
          className={`section-container flex items-center justify-between ${isScrolled ? "nav-capsule" : ""}`}
          style={{ 
            height: isScrolled ? "56px" : "64px",
            transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }}
          id="navbar"
        >
          {/* Zone 1 — Logo / Brand */}
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: isScrolled ? "14px" : "18px",
              fontWeight: 800,
              color: navTextColor,
              letterSpacing: "1px",
              textTransform: "uppercase",
              opacity: isScrolled ? 0.7 : 1,
              transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
              display: isScrolled ? "none" : "block"
            }}
            id="app-title"
          >
            Regulated Access Tokens
          </span>

          {/* Zone 2 — Tab Navigation */}
          <div 
            className="flex items-center gap-8" 
            id="tab-nav"
            style={{ 
              gap: isScrolled ? "24px" : "32px",
              transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`nav-tab ${activeTab === tab.key ? "active" : ""} ${isDarkTheme ? "nav-tab--light" : ""}`}
                onClick={() => handleTabSwitch(tab.key)}
                aria-current={activeTab === tab.key ? "page" : undefined}
                id={`tab-${tab.key}`}
                style={{ 
                  fontSize: isScrolled ? "13px" : "15px",
                  padding: isScrolled ? "4px 8px" : "8px 4px",
                  color: activeTab === tab.key ? navTextColor : navMutedColor,
                  transition: "color 0.4s ease, font-size 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), padding 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Zone 3 — Wallet CTA */}
          <div id="wallet-area" style={{ transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            {isConnected ? (
              <span 
                className="wallet-chip" 
                id="wallet-address" 
                style={{ 
                  transform: isScrolled ? "scale(0.9)" : "scale(1)",
                  backgroundColor: isDarkTheme ? "rgba(255,255,255,0.15)" : "var(--color-surface-grey)",
                  color: isDarkTheme ? "var(--color-white)" : "var(--color-near-black)",
                  borderColor: isDarkTheme ? "rgba(255,255,255,0.2)" : "var(--color-hairline)",
                  transition: "all 0.4s ease"
                }}
              >
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
                className={`btn-primary ${isDarkTheme ? "btn-primary--light" : ""}`}
                onClick={connectWallet}
                disabled={isConnecting}
                style={{ 
                  padding: isScrolled ? "8px 16px" : "12px 24px",
                  fontSize: isScrolled ? "12px" : "14px",
                  backgroundColor: isDarkTheme ? "var(--color-white)" : "var(--color-near-black)",
                  color: isDarkTheme ? "var(--color-near-black)" : "var(--color-white)",
                  transition: "all 0.4s ease"
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
      {/* Transition wrapper — fades + slides content between page switches  */}
      {/* ------------------------------------------------------------------ */}
      <div style={getContentStyle()}>
        {/* Active View */}
        <main className="flex-1" id="main-content">
          {displayedTab === "marketplace" && <MarketplaceView />}
          {displayedTab === "dashboard"   && <DashboardView />}
          {displayedTab === "mint"        && <MintView />}
        </main>

        {/* Footer — dark near-black, column layout */}
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
      </div>

      {/* Global Transaction Toast */}
      <TransactionToast />
    </div>
  );
}

