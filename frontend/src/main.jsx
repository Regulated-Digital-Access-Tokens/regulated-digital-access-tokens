import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WalletProvider } from "./blockchain/WalletContext";
import { TransactionProvider } from "./blockchain/TransactionContext";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <WalletProvider>
      <TransactionProvider>
        <App />
      </TransactionProvider>
    </WalletProvider>
  </StrictMode>
);
