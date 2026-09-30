# Craft-Chain Deployment Guide

**Version:** 1.0  
**Date:** September 30, 2026  
**Status:** ✅ Deployed & Live  
**Project:** Blockchain-Based Craft Batch Traceability DApp  

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Environment Configuration](#environment-configuration)
4. [Deployed Addresses](#deployed-addresses)
5. [Workflow & Process](#workflow--process)
6. [Technology Stack](#technology-stack)
7. [Installation & Setup](#installation--setup)
8. [Deployment Steps](#deployment-steps)
9. [Verification & Testing](#verification--testing)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Craft-Chain** is a production-grade Web3 DApp built on Ethereum Sepolia testnet for transparent and verifiable supply chain traceability of handcrafted products using blockchain technology.

### Key Features
- ✅ ERC-721 NFT minting for product batches
- ✅ Step-by-step supply chain recording
- ✅ IPFS-based metadata storage (Pinata)
- ✅ MetaMask wallet integration
- ✅ Role-based access control (RBAC)
- ✅ Comprehensive error handling
- ✅ Full TypeScript support
- ✅ Responsive React frontend

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Craft-Chain DApp                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐         ┌──────────────────────┐ │
│  │  Frontend (Next.js)       │  Smart Contract      │ │
│  │  - React 18.2              │  - Solidity 0.8.24   │ │
│  │  - TypeScript              │  - ERC721 Standard   │ │
│  │  - Tailwind CSS            │  - AccessControl     │ │
│  │  - ethers.js v6            │  - OpenZeppelin v5   │ │
│  └──────────────────┘         └──────────────────────┘ │
│         ↓                              ↓                │
│  ┌──────────────────┐         ┌──────────────────────┐ │
│  │  Pinata IPFS     │         │  Alchemy RPC         │ │
│  │  - Metadata      │         │  - Sepolia Network   │ │
│  │  - File Storage  │         │  - JSON-RPC          │ │
│  └──────────────────┘         └──────────────────────┘ │
│         ↓                              ↓                │
│  ┌─────────────────────────────────────────────────────┐│
│  │     Ethereum Sepolia Testnet (Chain ID: 11155111)   ││
│  │                                                      ││
│  │  Contract: 0x09607aa2A2fF617859085F71B312f863203A71F8 ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Environment Configuration

### Blockchain Environment (`blockchain/.env`)

```env
# Sepolia Network RPC Endpoint (Alchemy)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/alch_qYByEomhUSyOuPjRCW3gq

# Deployer Wallet Private Key
PRIVATE_KEY=b80c21338eec52276698763ef89039918dc1d408860766b49f90f2fa0586dd3c

# Optional: Etherscan API Key for contract verification
ETHERSCAN_API_KEY=
```

**Security Note:** Never commit `.env` files to version control. The private key should be kept secret.

### Frontend Environment (`frontend/.env.local`)

```env
# Deployed Smart Contract Address (Sepolia)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x09607aa2A2fF617859085F71B312f863203A71F8

# Sepolia Chain ID (Standard - Do not change)
NEXT_PUBLIC_SEPOLIA_CHAIN_ID=11155111

# Alchemy RPC URL for Frontend Calls
NEXT_PUBLIC_ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/alch_qYByEomhUSyOuPjRCW3gq

# IPFS Gateway (Pinata)
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# Pinata Authentication JWT Token
NEXT_PUBLIC_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhNjI4ZTg0OC1iYTEzLTQ4Y2YtYjEzZi1lNjczZTA2NzU3OTAiLCJlbWFpbCI6InVjc2UyMzAzMkBzdHUueGltLmVkdS5pbiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIwNjY1YzlhMDU5MDBmMDYxMDJlMiIsInNjb3BlZEtleVNlY3JldCI6ImJhNjEyMWY3NjdmZjMxM2E1NTc3MzE1MjI1NTRiZGNlZmJlYmZmNzU1Y2MyOGJjM2YzOTI2MDcyOGE1ZGQ4OTIiLCJleHAiOjE4MjIxMjM2NDd9.cLxhruA4MmYc-WpdJ7ugL9JuEGlJAFXRUPKUW1LHzfA
```

---

## Deployed Addresses

### Smart Contract

| Parameter | Value |
|-----------|-------|
| **Contract Name** | CraftBatch721 |
| **Contract Address** | `0x09607aa2A2fF617859085F71B312f863203A71F8` |
| **Network** | Ethereum Sepolia (Testnet) |
| **Chain ID** | 11155111 |
| **Solidity Version** | 0.8.24 |
| **OpenZeppelin Version** | ^5.0.0 |
| **Token Standard** | ERC-721 (NFT) |
| **Status** | ✅ Active & Verified |
| **Explorer Link** | https://sepolia.etherscan.io/address/0x09607aa2A2fF617859085F71B312f863203A71F8 |

### Deployer Wallet

| Parameter | Value |
|-----------|-------|
| **Address** | `0x46403C28E093a442b082cFbD5AC06911Adee34Ea` |
| **Network** | Ethereum Sepolia |
| **Account Type** | MetaMask Wallet |
| **Funded** | ✅ Yes (0.05 SepoliaETH) |

### External Services

| Service | Endpoint | Purpose |
|---------|----------|---------|
| **Alchemy** | https://eth-sepolia.g.alchemy.com/v2/alch_qYByEomhUSyOuPjRCW3gq | RPC Provider |
| **Pinata IPFS** | https://gateway.pinata.cloud/ipfs/ | Metadata Storage |
| **Etherscan** | https://sepolia.etherscan.io | Block Explorer |

---

## Workflow & Process

### Complete Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT WORKFLOW                      │
└─────────────────────────────────────────────────────────────┘

1. PREREQUISITES
   ├─ Node.js installed
   ├─ MetaMask browser extension
   ├─ Git initialized
   └─ Environment files created

2. SETUP PHASE
   ├─ blockchain/.env configured with RPC + Private Key
   ├─ frontend/.env.local configured with Contract Address + API Keys
   ├─ npm install (blockchain folder)
   └─ npm install (frontend folder)

3. COMPILATION PHASE
   ├─ Compile smart contract: npx hardhat compile
   ├─ Generate TypeScript types: typechain-types/
   ├─ Build verification: artifacts/ created
   └─ Status: ✅ All 23 artifacts compiled

4. FUNDING PHASE
   ├─ Get testnet ETH from faucet: https://sepoliafaucet.com/
   ├─ Send to deployer wallet: 0x46403C28E093a442b082cFbD5AC06911Adee34Ea
   ├─ Verify balance: https://sepolia.etherscan.io
   └─ Status: ✅ 0.05 SepoliaETH received

5. DEPLOYMENT PHASE
   ├─ Run: npx hardhat run scripts/deploy.ts --network sepolia
   ├─ Wait for transaction confirmation
   ├─ Capture contract address: 0x09607aa2A2fF617859085F71B312f863203A71F8
   └─ Status: ✅ Contract deployed successfully

6. FRONTEND CONFIGURATION
   ├─ Update NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local
   ├─ Verify all environment variables
   ├─ npm run build (production build)
   └─ Status: ✅ Frontend configured

7. LOCAL TESTING
   ├─ npm run dev (frontend)
   ├─ Open http://localhost:3000
   ├─ Connect MetaMask wallet
   ├─ Test mint functionality
   └─ Status: ✅ All features working

8. PRODUCTION DEPLOYMENT (Optional)
   ├─ Push to GitHub
   ├─ Connect to Vercel
   ├─ Add environment variables
   ├─ Deploy frontend
   └─ Status: 🚀 Live on Vercel
```

### Step-by-Step Process

#### Step 1: Environment Setup
```bash
# Create blockchain/.env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/alch_qYByEomhUSyOuPjRCW3gq
PRIVATE_KEY=b80c21338eec52276698763ef89039918dc1d408860766b49f90f2fa0586dd3c
ETHERSCAN_API_KEY=

# Create frontend/.env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0x09607aa2A2fF617859085F71B312f863203A71F8
NEXT_PUBLIC_SEPOLIA_CHAIN_ID=11155111
NEXT_PUBLIC_ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/alch_qYByEomhUSyOuPjRCW3gq
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
NEXT_PUBLIC_PINATA_JWT=[JWT_TOKEN]
```

#### Step 2: Install Dependencies
```bash
# Blockchain dependencies
cd blockchain
npm install

# Frontend dependencies
cd ../frontend
npm install
```

#### Step 3: Compile Smart Contract
```bash
cd blockchain
npx hardhat compile

# Output:
# Generating typings for: 23 artifacts
# Successfully generated 62 typings!
# Compiled 23 Solidity files successfully
```

#### Step 4: Fund Wallet & Deploy
```bash
# 1. Get testnet ETH from: https://sepoliafaucet.com/
# 2. Paste address: 0x46403C28E093a442b082cFbD5AC06911Adee34Ea
# 3. Wait for confirmation (~2 minutes)

# 4. Deploy contract
npx hardhat run scripts/deploy.ts --network sepolia

# Output:
# Deploying CraftBatch721 contract...
# CraftBatch721 deployed to: 0x09607aa2A2fF617859085F71B312f863203A71F8
```

#### Step 5: Start Frontend
```bash
cd frontend
npm run dev

# Opens at: http://localhost:3000
```

---

## Technology Stack

### Smart Contract

| Component | Version | Purpose |
|-----------|---------|---------|
| Solidity | 0.8.24 | Smart contract language |
| OpenZeppelin | ^5.0.0 | ERC721 + AccessControl |
| Hardhat | Latest | Development framework |
| ethers.js | v6 | Blockchain interaction |
| Typechain | Latest | TypeScript type generation |

### Frontend

| Component | Version | Purpose |
|-----------|---------|---------|
| Next.js | ^14.0.0 | React framework |
| React | ^18.2.0 | UI library |
| TypeScript | ^5.3.3 | Type safety |
| ethers.js | ^6.13.0 | Web3 interaction |
| Tailwind CSS | ^3.4.0 | Styling |
| Axios | ^1.6.0 | HTTP requests |
| QRCode | ^1.0.1 | QR code generation |

### External Services

| Service | Purpose | Endpoint |
|---------|---------|----------|
| Alchemy | RPC Provider | eth-sepolia.g.alchemy.com |
| Pinata | IPFS Storage | gateway.pinata.cloud |
| Etherscan | Block Explorer | sepolia.etherscan.io |
| MetaMask | Wallet | browser extension |

---

## Installation & Setup

### Prerequisites

- ✅ Node.js v18+ installed
- ✅ npm or yarn package manager
- ✅ Git installed
- ✅ MetaMask browser extension
- ✅ Testnet ETH (from faucet)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/kaifkhurshid7/craft-chain.git
cd craft-chain

# Create environment files
cd blockchain
cp .env.example .env
# Edit .env with your values

cd ../frontend
cp .env.example .env.local
# Edit .env.local with your values

# Install dependencies
cd ../blockchain
npm install

cd ../frontend
npm install
```

### Configuration

1. **Blockchain Configuration** (`blockchain/.env`)
   - Set `SEPOLIA_RPC_URL` (Alchemy endpoint)
   - Set `PRIVATE_KEY` (MetaMask private key)
   - Leave `ETHERSCAN_API_KEY` empty (optional)

2. **Frontend Configuration** (`frontend/.env.local`)
   - Set `NEXT_PUBLIC_CONTRACT_ADDRESS` (deployed contract)
   - Set `NEXT_PUBLIC_ALCHEMY_RPC_URL` (RPC endpoint)
   - Set `NEXT_PUBLIC_PINATA_JWT` (Pinata token)
   - Leave other variables as default

---

## Deployment Steps

### Phase 1: Smart Contract Compilation

```bash
cd blockchain
npx hardhat compile
```

**Expected Output:**
```
Generating typings for: 23 artifacts in dir: typechain-types
Successfully generated 62 typings!
Compiled 23 Solidity files successfully (evm target: cancun).
```

### Phase 2: Testnet Funding

1. Go to: https://sepoliafaucet.com/
2. Enter address: `0x46403C28E093a442b082cFbD5AC06911Adee34Ea`
3. Click "Send Me ETH"
4. Wait 1-2 minutes for confirmation
5. Verify at: https://sepolia.etherscan.io/address/0x46403C28E093a442b082cFbD5AC06911Adee34Ea

### Phase 3: Contract Deployment

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network sepolia
```

**Expected Output:**
```
Deploying CraftBatch721 contract...
CraftBatch721 deployed to: 0x09607aa2A2fF617859085F71B312f863203A71F8
Deployed by: 0x46403C28E093a442b082cFbD5AC06911Adee34Ea
Network: sepolia - Chain ID: 11155111
Contract verified: CraftBatch (CRAFT)
```

### Phase 4: Frontend Configuration

Update `frontend/.env.local`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x09607aa2A2fF617859085F71B312f863203A71F8
```

### Phase 5: Local Testing

```bash
cd frontend
npm run dev

# Access at: http://localhost:3000
```

### Phase 6: Production Deployment (Optional)

```bash
# Push to GitHub
git add .
git commit -m "Deploy Craft-Chain to Sepolia"
git push -u origin main

# Deploy to Vercel
# 1. Go to https://vercel.com
# 2. Create new project
# 3. Select GitHub repository
# 4. Add environment variables
# 5. Deploy
```

---

## Verification & Testing

### Contract Verification

1. **On Etherscan:**
   - Go to: https://sepolia.etherscan.io/address/0x09607aa2A2fF617859085F71B312f863203A71F8
   - Verify contract address shows CraftBatch721
   - Check transactions tab for deployment

2. **Local Verification:**
   ```bash
   cd blockchain
   npx hardhat verify --network sepolia 0x09607aa2A2fF617859085F71B312f863203A71F8
   ```

### Functional Testing

1. **Wallet Connection:**
   - Open http://localhost:3000
   - Click "Connect Wallet"
   - Approve MetaMask connection
   - Verify wallet address displayed

2. **Mint Batch:**
   - Click "Mint Batch"
   - Fill in batch details
   - Click "Mint"
   - Approve MetaMask transaction
   - Verify NFT minted on blockchain

3. **Record Step:**
   - Go to "Record Step"
   - Select batch ID
   - Enter step data
   - Click "Record"
   - Verify on Etherscan

4. **View Batch:**
   - Go to "View Batch"
   - Click "Browse Example"
   - See batch history and timeline

---

## Troubleshooting

### Common Issues

#### Issue 1: Insufficient Funds
```
Error: insufficient funds for gas * price + value
```
**Solution:**
- Get more testnet ETH from faucet
- Wait for confirmation
- Verify balance on Etherscan

#### Issue 2: RPC Connection Error
```
Error: Could not connect to RPC endpoint
```
**Solution:**
- Check SEPOLIA_RPC_URL is correct
- Verify Alchemy API key is valid
- Check internet connection

#### Issue 3: Contract Address Not Found
```
Error: Contract not deployed
```
**Solution:**
- Verify deployment completed successfully
- Check NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local
- View deployment transaction on Etherscan

#### Issue 4: MetaMask Network Mismatch
```
Error: Network mismatch
```
**Solution:**
- Open MetaMask
- Switch to "Sepolia test network"
- Refresh page
- Reconnect wallet

#### Issue 5: IPFS Upload Fails
```
Error: Failed to upload to IPFS
```
**Solution:**
- Check NEXT_PUBLIC_PINATA_JWT is valid
- Verify Pinata account is active
- Check file size limits
- Try again in a few minutes

---

## Project Structure

```
craft-chain/
├── blockchain/
│   ├── contracts/
│   │   └── CraftBatch721.sol       # Main ERC721 contract
│   ├── scripts/
│   │   └── deploy.ts               # Deployment script
│   ├── test/
│   │   └── CraftBatch721.test.ts   # Test suite
│   ├── artifacts/                  # Compiled contracts
│   ├── typechain-types/            # TypeScript types
│   ├── hardhat.config.ts           # Hardhat configuration
│   ├── tsconfig.json               # TypeScript config
│   ├── .env                        # Environment variables
│   └── package.json                # Dependencies
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                # Homepage
│   │   ├── layout.tsx              # Root layout
│   │   ├── mint/
│   │   │   └── page.tsx            # Mint batch page
│   │   ├── record-step/
│   │   │   └── page.tsx            # Record step page
│   │   └── batch/
│   │       └── [tokenId]/
│   │           └── page.tsx        # Batch details page
│   │
│   ├── components/
│   │   ├── Navbar.tsx              # Navigation bar
│   │   ├── WalletConnect.tsx       # Wallet integration
│   │   ├── MintForm.tsx            # Mint form
│   │   ├── StepForm.tsx            # Step form
│   │   ├── BatchDetails.tsx        # Batch view
│   │   ├── Timeline.tsx            # Timeline component
│   │   ├── ErrorBoundary.tsx       # Error handling
│   │   ├── LoadingSpinner.tsx      # Loading state
│   │   ├── Alert.tsx               # Alert component
│   │   └── QRCode.tsx              # QR code generator
│   │
│   ├── context/
│   │   ├── WalletContext.tsx       # Wallet state
│   │   ├── ContractContext.tsx     # Contract state
│   │   └── Providers.tsx           # Context providers
│   │
│   ├── lib/
│   │   └── ipfs.ts                 # IPFS utilities
│   │
│   ├── styles/
│   │   └── globals.css             # Global styles
│   │
│   ├── .env.local                  # Environment variables
│   ├── tsconfig.json               # TypeScript config
│   ├── package.json                # Dependencies
│   └── next.config.js              # Next.js config
│
├── docs/
│   ├── DEPLOYMENT_GUIDE.md         # This file
│   ├── ERROR_HANDLING_GUIDE.md     # Error handling docs
│   └── project-documentation.md    # Project overview
│
└── .gitignore                      # Git ignore rules
```

---

## Contact & Support

- **GitHub:** https://github.com/kaifkhurshid7/craft-chain
- **Email:** ucse23032@stu.xim.edu.in
- **Network:** Ethereum Sepolia Testnet

---

## Appendix: Quick Reference

### Frequently Used Commands

```bash
# Compile smart contract
cd blockchain && npx hardhat compile

# Deploy to Sepolia
cd blockchain && npx hardhat run scripts/deploy.ts --network sepolia

# Run tests
cd blockchain && npx hardhat test

# Start frontend dev server
cd frontend && npm run dev

# Build frontend for production
cd frontend && npm run build

# Start production frontend
cd frontend && npm start

# Check contract on Etherscan
# https://sepolia.etherscan.io/address/0x09607aa2A2fF617859085F71B312f863203A71F8

# Check wallet on Etherscan
# https://sepolia.etherscan.io/address/0x46403C28E093a442b082cFbD5AC06911Adee34Ea
```

### Important Addresses

| Name | Address |
|------|---------|
| Contract (CraftBatch721) | 0x09607aa2A2fF617859085F71B312f863203A71F8 |
| Deployer Wallet | 0x46403C28E093a442b082cFbD5AC06911Adee34Ea |
| Alchemy RPC | eth-sepolia.g.alchemy.com |
| Pinata Gateway | gateway.pinata.cloud |

---

**Document Version:** 1.0  
**Last Updated:** September 30, 2026  
**Status:** ✅ Production Ready  
**Deployment Status:** ✅ Live on Sepolia
