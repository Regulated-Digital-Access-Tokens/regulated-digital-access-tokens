import { useTransaction } from "../blockchain/TransactionContext";

/**
 * TransactionToast — Caldera Edition
 *
 * Obsidian panel with 40px radius, Ember pulse dot,
 * DM Sans 500, Chalk text. No shadow.
 */
export default function TransactionToast() {
  const { isTransactionPending } = useTransaction();

  if (!isTransactionPending) return null;

  return (
    <div
      className="console-card"
      id="transaction-toast"
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        minWidth: "260px",
        maxWidth: "340px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}
    >
      {/* Pulsing Ember indicator dot */}
      <span
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "9999px",
          backgroundColor: "var(--color-ember)",
          flexShrink: 0,
          animation: "pulse-dot 1.4s ease-in-out infinite",
        }}
      />

      <div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-body)",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--color-chalk)",
            lineHeight: 1.3,
          }}
        >
          Transaction Pending
        </p>
        <p
          className="text-micro"
          style={{ color: "rgba(255,255,255,0.45)", marginTop: "3px" }}
        >
          Awaiting confirmation…
        </p>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}
