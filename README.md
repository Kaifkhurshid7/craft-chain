# Craft-Chain

## Blockchain-Based Craft Batch Traceability System

Craft-Chain is a decentralized application (DApp) that provides transparent and verifiable traceability for handcrafted product batches. Each batch is represented by a unique ERC-721 NFT on the Ethereum Sepolia testnet. Custody transfers and processing events are recorded on-chain, while large metadata and step details are stored on IPFS. This creates an immutable, cryptographically verified supply chain record accessible to all participants.

---

## Overview

### What It Does

Craft-Chain enables participants in a craft supply chain to record and verify the complete history of a product batch:

1. **Artisans** mint an ERC-721 NFT representing a batch of handcrafted products
2. **Metadata** (images, descriptions, origin, materials) is uploaded to IPFS
3. **Custody transfers** follow standard ERC-721 mechanisms as products move through the supply chain
4. **Processing steps** are recorded on-chain with cryptographic verification of off-chain details
5. **Buyers** can access the complete batch history through a QR code or token ID

### Why It Exists

Handcraft supply chains typically lack centralized, verifiable records. Participants maintain separate documentation, making it difficult to verify product origin or track custody changes. Craft-Chain addresses this by creating a single, immutable source of truth that all participants can independently verify.

### Architecture

The system uses a hybrid on-chain/off-chain approach:

- **Blockchain**: Records ownership, custody transfers, and step hashes
- **IPFS**: Stores batch metadata, images, and step details
- **Smart Contract**: Manages minting, step recording, and role-based access control

This approach minimizes blockchain costs while maintaining full verifiability through cryptographic hashing.

---

## Problem Statement

### Current Supply Chain Challenges

Handcrafted product supply chains face several traceability issues:

- **Fragmented Records**: Information is scattered across spreadsheets, emails, and local databases
- **Limited Transparency**: Participants outside the direct chain have no visibility into product history
- **Difficult Verification**: No cryptographic proof of origin or processing steps
- **Custody Ambiguity**: Difficult to establish who held the product and when
- **Trust Gap**: Buyers cannot independently verify product authenticity or ethical sourcing claims

### Impact

These challenges result in:

- Inability to authenticate handcrafted products
- Loss of premium pricing for authenticated goods
- Difficulty resolving disputes over product handling or quality
- Missed opportunities for ethical supply chain marketing

---

## Solution

### System Design

Craft-Chain records batch information across three layers:

```
Batch Information
├── On-Chain (Blockchain)
│   ├── Token ID (unique identifier)
│   ├── Owner address (current custodian)
│   ├── Metadata URI (reference to IPFS)
│   ├── Transfer events (ownership changes)
│   └── Step hashes (cryptographic verification)
│
├── Off-Chain (IPFS)
│   ├── Batch metadata JSON
│   ├── Product images
│   └── Processing step details
│
└── User Interface (Next.js Frontend)
    ├── Wallet connection (MetaMask)
    ├── Batch minting interface
    ├── Step recording interface
    └── Timeline visualization
```

### Basic Workflow

```
Artisan Creates Batch
    ↓
[Metadata → IPFS] + [NFT Metadata URI → Blockchain]
    ↓
Batch NFT Minted (Token ID assigned)
    ↓
Transfer to Co-op (Standard ERC-721 transfer)
    ↓
Co-op Records Steps
    ↓
[Step Details → IPFS] + [Step Hash → Blockchain]
    ↓
Transfer to Retailer
    ↓
Transfer to Buyer
    ↓
Buyer Verifies (QR Code → Batch Details Page → Complete History)
```

### Data Verification

For each step:

1. Original step JSON is created and uploaded to IPFS
2. SHA-256 hash is calculated from the JSON
3. Hash is recorded on-chain in the StepRecorded event
4. Later, the IPFS data is retrieved and hash is recalculated
5. If hashes match, the data is verified as authentic and unchanged

---

## Key Features

### Implemented

- ERC-721 NFT standard for batch representation
- Role-based access control (MINTER_ROLE for authorized batch creation)
- IPFS integration for off-chain storage
- Step recording with cryptographic hashing
- Standard ERC-721 custody transfers
- Batch timeline reconstruction from blockchain events
- QR code generation and linking
- MetaMask wallet integration
- Ethereum Sepolia testnet support

### Planned

- Batch modification with audit trail
- Advanced supply chain analytics
- Mobile application
- Multi-chain support

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js | 14.x |
| UI Library | React | 18.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| Smart Contract | Solidity | 0.8.x |
| NFT Standard | ERC-721 | OpenZeppelin |
| Contract Framework | Hardhat | 2.x |
| Contracts Library | OpenZeppelin Contracts | 5.x |
| Blockchain Integration | ethers.js | 6.x |
| Wallet | MetaMask | - |
| RPC Provider | Alchemy | - |
| Decentralized Storage | IPFS | - |
| Pinning Service | Pinata | - |
| Deployment | Vercel | - |
| Version Control | GitHub | - |

---

## System Architecture

```
┌─────────────────────────────────────────┐
│     Users (Artisan, Co-op, Buyer)       │
└──────────────────┬──────────────────────┘
                   │
           ┌───────▼────────┐
           │  Next.js DApp  │
           │  TypeScript    │
           └───────┬────────┘
                   │
        ┌──────────┴────────────┐
        │                       │
     ┌──▼──┐            ┌──────▼──────┐
     │ IPFS│            │  ethers.js  │
     └──┬──┘            │  MetaMask   │
        │               └──────┬──────┘
        │                      │
   ┌────▼─────┐           ┌────▼──────────┐
   │ Batch    │           │  Alchemy RPC  │
   │ Metadata │           │  Sepolia      │
   │ Images   │           └────┬──────────┘
   │ Steps    │                │
   └──────────┘         ┌──────▼───────────────┐
                        │ Ethereum Sepolia    │
                        ├─────────────────────┤
                        │ CraftBatch721.sol   │
                        │ - ERC-721 NFT       │
                        │ - Minting           │
                        │ - Step Recording    │
                        │ - Transfers         │
                        │ - Events            │
                        └─────────────────────┘
```

---

## Project Structure

```
craft-chain/
├── blockchain/                          # Smart contract layer
│   ├── contracts/
│   │   └── CraftBatch721.sol           # Main contract (ERC-721 + AccessControl)
│   ├── scripts/
│   │   └── deploy.ts                   # Deployment script
│   ├── test/
│   │   └── CraftBatch721.test.ts       # Test suite
│   ├── ignition/
│   │   └── modules/
│   │       └── CraftBatch721.ts        # Ignition deployment module
│   ├── hardhat.config.ts               # Hardhat configuration
│   ├── tsconfig.json                   # TypeScript config
│   └── package.json                    # Dependencies
│
├── frontend/                            # User interface layer
│   ├── app/
│   │   ├── page.tsx                    # Dashboard
│   │   ├── layout.tsx                  # Root layout
│   │   ├── mint/
│   │   │   └── page.tsx                # Batch minting interface
│   │   ├── record-step/
│   │   │   └── page.tsx                # Step recording interface
│   │   └── batch/
│   │       └── [tokenId]/
│   │           └── page.tsx            # Batch details and timeline
│   ├── components/
│   │   ├── Navbar.tsx                  # Navigation bar
│   │   ├── WalletConnect.tsx           # MetaMask connection
│   │   ├── MintForm.tsx                # Batch minting form
│   │   ├── StepForm.tsx                # Step recording form
│   │   ├── BatchDetails.tsx            # Batch information display
│   │   ├── Timeline.tsx                # Event timeline
│   │   └── QRCode.tsx                  # QR code generation
│   ├── lib/
│   │   ├── contract.ts                 # Contract configuration and ABI
│   │   ├── blockchain.ts               # ethers.js utilities
│   │   └── ipfs.ts                     # IPFS integration
│   ├── public/                         # Static assets
│   └── package.json                    # Dependencies
│
├── docs/
│   ├── project-documentation.md        # Complete technical documentation
│   ├── architecture/                   # Architecture diagrams
│   └── screenshots/                    # UI screenshots
│
├── .gitignore                          # Git ignore rules
├── LICENSE                             # Project license
└── README.md                           # This file
```

---

## Smart Contract Specification

### CraftBatch721.sol

The main smart contract implementing ERC-721 NFT functionality with batch minting and step recording.

#### Key Components

- **ERC-721 Implementation**: Non-fungible tokens via OpenZeppelin
- **AccessControl**: Role-based permissions via OpenZeppelin
- **MINTER_ROLE**: Restricts who can create new batches

#### Main Functions

| Function | Visibility | Access | Purpose |
|----------|-----------|--------|---------|
| `mintBatch(to, uri)` | Public | MINTER_ROLE | Mint new batch NFT |
| `recordStep(tokenId, hash)` | Public | Token owner | Record processing step |
| `transferFrom(from, to, id)` | Public | Owner/Approved | Transfer ownership |
| `safeTransferFrom(from, to, id)` | Public | Owner/Approved | Safe transfer with validation |
| `ownerOf(tokenId)` | View | Public | Get current owner |
| `tokenURI(tokenId)` | View | Public | Get IPFS metadata URI |

#### Events

- **Transfer** (inherited from ERC-721): Emitted on ownership changes
- **StepRecorded**: Emitted when a step is recorded
  - `tokenId`: Batch identifier
  - `actor`: Address recording the step
  - `stepHash`: SHA-256 hash of step data
  - `timestamp`: Block timestamp

---

## Data Storage Architecture

### On-Chain (Ethereum Sepolia)

Information stored on blockchain:

- Token ID (unique batch identifier)
- Current owner address
- Token metadata URI (points to IPFS)
- Transfer events (ownership history)
- Step hashes (verification data)
- Actor addresses (who recorded each step)
- Timestamps (when events occurred)

**Why**: Immutability, decentralized verification, audit trail

### Off-Chain (IPFS)

Information stored on IPFS:

- Batch metadata JSON (name, description, origin, material, production date)
- Product images
- Step details (description, location, date, processing information)

**Example Batch Metadata**:
```json
{
  "name": "Handwoven Cotton Shawl",
  "description": "Premium handcrafted cotton product",
  "image": "ipfs://QmABC123...",
  "attributes": [
    {"trait_type": "Origin", "value": "Odisha, India"},
    {"trait_type": "Material", "value": "100% Cotton"},
    {"trait_type": "Production Date", "value": "2026-09-26"}
  ]
}
```

**Why**: Cost-effective, supports large files, permanently archived with pinning service

---

## Development

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- Git
- MetaMask browser extension
- Alchemy account (free tier sufficient)
- Pinata account (free tier sufficient)

### Setup

#### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/craft-chain.git
cd craft-chain
```

#### 2. Configure Blockchain

```bash
cd blockchain

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=your_wallet_private_key
EOF

# Compile smart contract
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia
```

Save the deployed contract address for the next step.

#### 3. Configure Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cat > .env.local << EOF
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...deployed_address...
NEXT_PUBLIC_SEPOLIA_CHAIN_ID=11155111
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
EOF

# Start development server
npm run dev
```

Visit `http://localhost:3000` and connect MetaMask to Sepolia network.

---

## Usage

### For Artisans: Mint a Batch

1. Connect wallet with MetaMask
2. Navigate to "Mint Batch"
3. Enter batch information (name, description, origin, material, production date)
4. Upload product image
5. Click "Mint"
6. Approve transaction in MetaMask
7. Receive token ID

### For Participants: Record a Step

1. Connect wallet (must be current batch owner)
2. Navigate to "Record Step"
3. Enter token ID of the batch
4. Select step type (Processing, Transportation, Quality Check, Packaging, Other)
5. Enter description, location, and date/time
6. Click "Record Step"
7. Approve transaction in MetaMask
8. Step is recorded on blockchain with cryptographic verification

### For Participants: Transfer Custody

1. Connect wallet (must be current batch owner)
2. Navigate to batch details page
3. Click "Transfer Batch"
4. Enter recipient wallet address
5. Approve transaction in MetaMask
6. Ownership transfers to recipient

### For Buyers: Verify a Batch

1. Scan QR code on product packaging
2. Browser opens batch details page
3. Review complete batch information:
   - Origin and artisan details
   - Product metadata and images
   - All custody transfers (who held it and when)
   - All processing and transportation steps
   - Current owner
4. Verify authenticity based on information

---

## Security Considerations

### Smart Contract

- Role-based access control prevents unauthorized minting
- Only current token owner can record steps
- Standard ERC-721 transfer mechanisms prevent token theft
- Cryptographic hashes verify data integrity without storing full data on-chain

### Frontend

- Private keys never stored in code or browser storage
- MetaMask used for transaction signing
- Environment variables for sensitive configuration
- Input validation on all forms

### Data Privacy

- No personally identifiable information stored on blockchain (expected)
- No sensitive business data on IPFS
- All IPFS data is public (appropriate for supply chain transparency)
- Batch metadata is limited to product information, not personal details

---

## Testing

### Smart Contract Tests

```bash
cd blockchain
npx hardhat test
```

### Test Coverage

```bash
npx hardhat coverage
```

### Manual Testing Checklist

- Wallet connection to Sepolia
- Network detection (correct network alert)
- Batch minting with all metadata
- IPFS metadata upload and retrieval
- Step recording with hash verification
- Token transfer between accounts
- Batch timeline reconstruction from events
- QR code generation and functionality
- Error handling for edge cases
- Responsive design on mobile

---

## Deployment

### Deploy Smart Contract to Sepolia

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network sepolia
```

Output will include the deployed contract address. Save this for frontend configuration.

### Deploy Frontend to Vercel

```bash
# Push code to GitHub
git add .
git commit -m "Production ready"
git push origin main

# Deploy via Vercel
# 1. Visit https://vercel.com
# 2. Import your GitHub repository
# 3. Add environment variables (NEXT_PUBLIC_CONTRACT_ADDRESS, etc.)
# 4. Click Deploy
```

---

## Documentation

### Complete Technical Documentation

See [`docs/project-documentation.md`](./docs/project-documentation.md) for:

- Detailed system architecture
- Smart contract specifications and function reference
- Frontend component documentation
- Deployment instructions
- Troubleshooting guide
- Future enhancement roadmap

---

## Project Status

| Component | Status | Notes |
|-----------|--------|-------|
| Smart Contract | Design Complete | Ready for implementation |
| Frontend Structure | Ready | Pages and components scaffolded |
| IPFS Integration | Design Complete | Implementation pending |
| Blockchain Configuration | Ready | Hardhat configured for Sepolia |
| Documentation | Complete | Comprehensive technical documentation |

### Current Phase

Development - Smart contract and frontend implementation pending.

---

## License

This project is released under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## Academic Use

This project demonstrates:

- ERC-721 non-fungible token implementation
- Role-based access control in smart contracts
- Blockchain-based supply chain traceability
- Cryptographic verification of off-chain data
- Integration of decentralized storage (IPFS) with blockchain
- Web3 frontend development with ethers.js
- Smart contract testing with Hardhat

Suitable for courses in distributed systems, blockchain development, supply chain management, and Web3 application development.

---

## References

- [OpenZeppelin ERC-721 Standard](https://docs.openzeppelin.com/contracts/4.x/erc721)
- [Ethereum Sepolia Testnet](https://www.alchemy.com/list/ethereum/sepolia)
- [IPFS Documentation](https://docs.ipfs.io/)
- [ethers.js Documentation](https://docs.ethers.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [MetaMask Developer Documentation](https://docs.metamask.io/)
