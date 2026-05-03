# Regulated Digital Access Tokens

## Project Overview

This project implements a token protocol that embeds economic policy and studies its effects on resale behavior. It consists of a custom ERC-721 smart contract that enforces secondary market rules directly on-chain, effectively turning a freely tradable asset into a regulated economic instrument.

By moving enforcement from off-chain marketplaces to on-chain protocol rules, the system guarantees deterministic policy enforcement where price caps cannot be bypassed, royalties cannot be skipped, and transfers cannot occur outside the established rules.

## Core Mechanics

Unlike standard NFTs where users can transfer tokens freely and marketplaces enforce rules off-chain, this system disables standard transfer functions (`transferFrom()`, `approve()`, `setApprovalForAll()`) and requires users to utilize a controlled `buyToken()` function.

The contract enforces the following rules:
- **Price Cap:** Resale price cannot exceed 110% of the mint price.
- **Royalty:** A 10% royalty is automatically directed to the original creator upon resale.
- **Payment Split:** Payments are automatically routed such that the buyer pays the contract, and the contract splits the funds between the creator and the seller.

## Research Implications

This project demonstrates that smart contracts can act as regulators, not just ledgers, establishing that code is law, and markets are regulated by code.

Key research areas explored include:
- **The Liquidity vs. Fairness Tradeoff:** Enforcing strict on-chain economic constraints preserves fairness, enforces creator royalties, and prevents scalping, but inherently reduces market liquidity.
- **Mechanism Design:** Parameters like the 110% cap and 10% royalty function as economic control variables. Because the royalty is deducted from seller proceeds and the cap limits price increases, the break-even price often exceeds the allowed cap, 
**economically discouraging resale for profit**.
- **Protocol-level Marketplaces:** The token acts as its own marketplace, eliminating the need for intermediaries and demonstrating that every asset can carry its own marketplace rules.
- **Composability Consequences:** The project breaks standard Ethereum design philosophy (which assumes tokens should be freely transferable) to achieve economic control.

## Tech Stack

- **Smart Contracts:** Solidity, OpenZeppelin, Hardhat
- **Frontend:** React, Vite, Tailwind CSS, Ethers.js
- **Network:** Sepolia Testnet

## Repository Structure

```text
contracts/                  # Smart contracts
test/                       # Hardhat tests
scripts/                    # Deployment scripts
ignition/                   # Hardhat Ignition deployment modules
frontend/                   # React frontend application
docs/                       # Architecture and research notes
```

## Setup and Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Smart Contract Environment

1. Install dependencies in the root directory:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Copy `.env.example` to `.env` and configure your RPC URL and private key.
   ```bash
   cp .env.example .env
   ```

3. Compile the smart contracts:
   ```bash
   npx hardhat compile
   ```

4. Run tests:
   ```bash
   npx hardhat test
   ```

5. Deploy contracts locally:
   ```bash
   npx hardhat node
   ```
   In a separate terminal:
   ```bash
   npx hardhat ignition deploy ignition/modules/TokenModule.ts --network localhost
   ```

### Deploying to Sepolia Testnet

If you want to deploy your own instance of the contract to the Sepolia testnet:

1. Ensure your `.env` file has a valid `SEPOLIA_RPC_URL` and `SEPOLIA_PRIVATE_KEY` populated with an account that has Sepolia test ETH.
2. Run the deployment script:
   ```bash
   npx hardhat ignition deploy ignition/modules/TokenModule.ts --network sepolia
   ```

## Interacting with the Deployed Contract

We have already deployed an instance of the `RegulatedToken` to the Sepolia Testnet.

- **Contract Address:** `0x6B37969185920d59234b5Dcf5Bf7Fa25fdA794d3`
- **Network:** Sepolia Testnet (Chain ID: 11155111)

You can interact with this contract using the provided React frontend:

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Connect your Web3 wallet (e.g., MetaMask) to the Sepolia testnet and ensure you have test ETH. The frontend will default to interacting with the deployed contract address.

## License

This project is open-source and available under the [MIT License](LICENSE).
