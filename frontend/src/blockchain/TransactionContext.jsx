import { createContext, useState, useContext, useCallback } from "react";

// ---------------------------------------------------------------------------
// TransactionContext
// Provides a global "transaction pending" flag that any write hook can set
// to trigger the TransactionToast overlay.
// ---------------------------------------------------------------------------
const TransactionContext = createContext(null);

export function TransactionProvider({ children }) {
  const [isTransactionPending, setIsTransactionPending] = useState(false);

  const startTransaction = useCallback(() => setIsTransactionPending(true), []);
  const endTransaction = useCallback(() => setIsTransactionPending(false), []);

  return (
    <TransactionContext.Provider
      value={{ isTransactionPending, startTransaction, endTransaction }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransaction() {
  const context = useContext(TransactionContext);
  if (context === null) {
    throw new Error(
      "useTransaction() must be used inside a <TransactionProvider>."
    );
  }
  return context;
}
