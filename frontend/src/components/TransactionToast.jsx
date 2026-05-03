import { useTransaction } from "../blockchain/TransactionContext";

/**
 * TransactionToast
 *
 * A fixed bottom-right notification that appears whenever a blockchain
 * write transaction is in-flight. Disappears automatically when the
 * transaction resolves.
 */
export default function TransactionToast() {
  const { isTransactionPending } = useTransaction();

  if (!isTransactionPending) return null;

  return (
    <div className="fixed bottom-4 right-4 p-4" id="transaction-toast">
      <p>Transaction pending — please wait…</p>
    </div>
  );
}
