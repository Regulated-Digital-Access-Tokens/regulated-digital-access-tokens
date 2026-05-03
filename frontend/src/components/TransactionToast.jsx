import { useTransaction } from "../blockchain/TransactionContext";

/**
 * TransactionToast
 *
 * agent-console-card style — near-black panel, fixed bottom-right.
 * Shows while any blockchain write is in-flight.
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
        minWidth: "240px",
        maxWidth: "320px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      {/* Pulsing indicator dot */}
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "9999px",
          backgroundColor: "var(--color-coral)",
          flexShrink: 0,
          animation: "pulse-dot 1.4s ease-in-out infinite",
        }}
      />

      <div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--color-white)",
            lineHeight: 1.3,
          }}
        >
          Transaction Pending
        </p>
        <p
          className="text-micro"
          style={{ color: "rgba(255,255,255,0.5)", marginTop: "2px" }}
        >
          Awaiting confirmation…
        </p>
      </div>

      {/* Inline keyframe for the pulse animation */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}
