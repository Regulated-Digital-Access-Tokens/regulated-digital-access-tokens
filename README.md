# Regulated Digital Access Tokens

## Project Overview

This project implements a custom **ERC-721 smart contract** that enforces **secondary market rules directly on-chain**.

Unlike standard NFTs:

- Peer-to-peer transfers are disabled
- All resales must happen through the contract marketplace
- Resale price is capped at **110%** of mint price
- **10% royalty** automatically goes to the original creator

---

## Tech Stack

- Solidity
- OpenZeppelin
- Hardhat
- React
- Ethers.js
- Sepolia Testnet

---

## Repository Structure

```bash
contracts/                  # Smart contracts
test/                       # Hardhat tests
scripts/                    # Deployment scripts
frontend/src/blockchain/    # Ethers integration
frontend/src/components/    # UI components
docs/                       # Architecture + research notes
