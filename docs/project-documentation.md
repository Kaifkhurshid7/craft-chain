# Craft-Chain: Blockchain-Based Craft Batch Traceability System

## Complete Technical Documentation

**Version:** 1.0  
**Last Updated:** September 26, 2026  
**Status:** Development Phase (Ready for Implementation)  
**Audience:** Developers, Stakeholders, Academic Reviewers

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [Project Objectives](#4-project-objectives)
5. [Scope of the Project](#5-scope-of-the-project)
6. [Users and Roles](#6-users-and-roles)
7. [Technology Stack](#7-technology-stack)
8. [System Architecture](#8-system-architecture)
9. [Smart Contract Specification](#9-smart-contract-specification)
10. [Data Architecture](#10-data-architecture)
11. [Frontend Pages and Components](#11-frontend-pages-and-components)
12. [API and Function Reference](#12-api-and-function-reference)
13. [Security and Privacy](#13-security-and-privacy)
14. [Development Environment Setup](#14-development-environment-setup)
15. [Deployment Instructions](#15-deployment-instructions)
16. [Testing and Quality Assurance](#16-testing-and-quality-assurance)
17. [Troubleshooting Guide](#17-troubleshooting-guide)
18. [Future Enhancements](#18-future-enhancements)
19. [Conclusion](#19-conclusion)

---

## 1. Executive Summary

**Craft-Chain** is a blockchain-based decentralized application (DApp) designed to provide transparent and tamper-evident traceability for handcrafted product batches.

### Key Innovation

Each product batch receives a unique **ERC-721 NFT** on the Ethereum Sepolia testnet. This NFT serves as the permanent, immutable digital identity and ownership certificate for the batch throughout its entire supply chain journey.

### Key Value Propositions

| Proposition | Benefit |
|-------------|---------|
| **Transparency** | All transactions recorded permanently on blockchain |
| **Immutability** | Data cannot be retroactively altered or deleted |
| **Verification** | Cryptographic proof of all recorded events |
| **Efficiency** | Decentralized storage reduces cost and dependency |
| **Accessibility** | Any buyer can independently verify authenticity |
| **Accountability** | Complete audit trail of all participants |

### System Highlights

- **ERC-721 NFT per batch** — Each batch is unique and non-fungible
- **Ethereum Sepolia testnet** — Secure, established network for demonstration
- **IPFS metadata storage** — Decentralized, censorship-resistant, permanent
- **On-chain verification hashes** — Verify data integrity without storing full data
- **Complete ownership history** — All transfers recorded as blockchain events
- **Processing step tracking** — Record all custody changes and processing events
- **QR code verification** — Buyers scan to access complete batch history
- **Role-based security** — Authorized personnel only can mint and record

---

## 2. Problem Statement

### 2.1 Current Challenges in Craft Supply Chains

Traditional craft-product supply chains rely on disconnected records:

* **Paper-based documentation** — invoices, certificates, handwritten records
* **Spreadsheets** — maintained locally, prone to errors and inconsistency
* **Email communications** — scattered across multiple inboxes
* **Proprietary databases** — locked within single organizations
* **No standardized format** — each participant uses different systems

### 2.2 Problems This Creates

| Problem | Impact | Real-World Example |
|---------|--------|-------------------|
| **No Origin Verification** | Buyers cannot independently verify product source | Claim: "Handmade in Odisha" — No cryptographic proof |
| **Limited Supply Chain Visibility** | Information silos prevent transparency | Only artisan knows who touched the product |
| **Difficult Custody Tracking** | Hard to prove who held the product and when | Dispute: "Did the distributor tamper with it?" |
| **Non-Verifiable Records** | Records can be falsified or altered | Modified invoice dates, missing signatures |
| **Information Fragmentation** | Data scattered across multiple systems | Product info in 5 different databases |
| **Buyer Access Denied** | Final consumer has no access to history | Buyer cannot verify authenticity before purchase |
| **No Audit Trail** | Cannot prove integrity of changes | "Did this product ever go through QC?" |
| **Counterfeiting Risk** | Fake artisanal products sold at premium prices | No way to distinguish authentic from fake |

### 2.3 Real-World Example Scenario

```
Handwoven Shawl from Odisha

Artisan creates shawl
    ↓
Sends to Co-op (by phone call + email)
    ↓
Co-op sends to Retailer (handwritten invoice)
    ↓
Retailer sells to Buyer
    ↓
Buyer receives shawl but has NO verifiable proof of:
  - Whether it was actually made by the claimed artisan
  - What processing steps it underwent
  - Who handled it at each step
  - If quality standards were met
  - If it was tampered with in transit
  - Current legitimate ownership
```

### 2.4 Business Impact

- **Counterfeiting:** Fake artisanal products sold at premium prices
- **Liability:** Retailers unable to prove product authenticity to customers
- **Customer Trust:** Buyers skeptical of origin and quality claims
- **Market Efficiency:** Legitimate products cannot command premium prices due to lack of proof
- **Disputes:** No authoritative record to resolve custody conflicts
- **Compliance:** Difficult to demonstrate adherence to ethical/environmental standards

---

## 3. Proposed Solution

### 3.1 Core Architecture

Craft-Chain represents each product batch using an **ERC-721 NFT**. The NFT contains or references the batch's metadata and follows the product through the supply chain.

**Key Design Decisions:**

| Decision | Rationale |
|----------|-----------|
| **ERC-721 (Not Fungible)** | Each batch is unique; requires unique token |
| **Ethereum Sepolia** | Testnet for demonstration; low/free transaction costs |
| **IPFS for Large Data** | Decentralized; censorship-resistant; permanent archiving |
| **On-Chain Hashes** | Verify IPFS data integrity without storing full data |
| **Standard ERC-721 Transfers** | Leverage battle-tested ownership mechanics |
| **Role-Based Minting** | Prevent unauthorized batch creation |

### 3.2 Basic Workflow

```
Artisan                    Blockchain                    IPFS
   |                            |                          |
   |--- Batch Data ----→ Upload to IPFS
   |                            |← CID (Metadata)
   |                            |
   |--- mintBatch(CID) ------→ Create NFT #101
   |                            |
   |← Token #101 ←─────────────|
   |
   |--- Transfer to Co-op ---→ safeTransferFrom()
   |                            |
   |                    Co-op owns NFT #101
   |
   |--- Record Step --------→ Upload Step JSON to IPFS
   |                            |← CID
   |                            |
   |--- recordStep(hash) ---→ StepRecorded Event
   |                            |
   |                    On-chain hash stored
   |
   |--- Transfer to Retailer → safeTransferFrom()
   |                            |
   |                    Retailer owns NFT #101
   |
                         ... Continues ...
                         
                    Final Buyer Verification
                            |
                    View complete history:
                    - All transfers
                    - All steps with verification
                    - Original metadata
                    - Complete timeline
```

### 3.3 How It Solves the Problems

| Problem | Solution |
|---------|----------|
| **No Origin Verification** | Artisan's address recorded on-chain in mint event |
| **Limited Visibility** | All transfers and steps recorded publicly |
| **Custody Tracking** | Complete transfer history from blockchain events |
| **Non-Verifiable Records** | Cryptographic hash verification of all data |
| **Information Fragmentation** | Single source of truth on blockchain + IPFS |
| **Buyer Access Denied** | Anyone can view complete history via QR/Token ID |
| **No Audit Trail** | Immutable blockchain transaction log |
| **Counterfeiting** | Verifiable proof links physical product to NFT |

---

## 4. Project Objectives

### 4.1 Primary Objectives

1. **Create Blockchain Identity** — Assign unique ERC-721 NFT to each product batch
2. **Record Ownership** — Use standard ERC-721 transfers for custody changes
3. **Store Metadata Securely** — Upload large data to IPFS with on-chain references
4. **Verify Integrity** — Use cryptographic hashes to verify off-chain data
5. **Record Processing Events** — Capture all custody changes and processing steps
6. **Provide Timeline** — Reconstruct complete batch history from blockchain events
7. **Enable Public Verification** — Allow any buyer to independently verify batch history
8. **Demonstrate on Testnet** — Fully functional system on Ethereum Sepolia
9. **Ensure Security** — Implement role-based access control and proper validation
10. **Maintain Privacy** — No sensitive personal data on-chain or IPFS

### 4.2 Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| **Smart Contract Deployment** | Contract deployed on Sepolia | ✓ Contract address live |
| **Minting Functionality** | Can mint NFT with metadata | ✓ Token ID generated |
| **Custody Transfers** | Standard ERC-721 transfers work | ✓ Ownership changes recorded |
| **Step Recording** | Can record processing steps | ✓ StepRecorded events emitted |
| **Timeline Generation** | All events display in order | ✓ Chronological history visible |
| **QR Code Functionality** | QR code links to batch page | ✓ URL resolves correctly |
| **IPFS Integration** | Data persists on IPFS | ✓ Can retrieve after 24 hours |
| **Security Tests** | Unauthorized minting prevented | ✓ Only MINTER_ROLE can mint |
| **Frontend Deployment** | Live application on Vercel | ✓ URL accessible publicly |
| **Complete User Flow** | End-to-end workflow tested | ✓ All pages functional |

---

## 5. Scope of the Project

### 5.1 In Scope

**Blockchain & NFTs:**
- ERC-721 batch NFTs on Ethereum Sepolia
- Role-based minting (MINTER_ROLE)
- Standard ERC-721 ownership transfers
- Custody change recording with on-chain events
- Step recording with cryptographic verification
- Complete smart contract test suite
- Hardhat deployment and testing framework

**Frontend & User Interface:**
- Next.js web application with TypeScript
- MetaMask wallet integration
- Batch minting interface
- Step recording interface
- Batch details and timeline visualization
- QR code generation and scanning
- Responsive design with Tailwind CSS
- Network detection (Sepolia vs. wrong network)
- Comprehensive error handling

**Data Storage:**
- IPFS integration for metadata and step JSON
- IPFS pinning service for data persistence
- Cryptographic hashing of step data
- On-chain storage of hashes only (not full data)

**Deployment & Infrastructure:**
- Smart contract deployment to Sepolia
- Frontend deployment to Vercel
- GitHub repository with proper .gitignore
- Environment variable management
- Development and testing workflows

**Documentation:**
- Complete technical documentation
- Architecture diagrams
- Smart contract function documentation
- API reference
- User guide and workflow instructions
- Deployment instructions

### 5.2 Out of Scope

**Mainnet & Production:**
- Mainnet deployment (Sepolia testnet only)
- Real-money transactions or payments
- Production-scale infrastructure
- Enterprise compliance certifications

**Advanced Features:**
- IoT sensor integration
- GPS/physical tracking
- Mobile native applications
- Multi-chain support
- Batch modification after minting
- Advanced analytics or dashboards

**Personal Data & Privacy:**
- Real personal information storage
- PII on blockchain or IPFS
- Enterprise authentication systems
- Compliance with GDPR or similar regulations

**Integration:**
- Integration with existing ERP systems
- Real manufacturing process automation
- Physical supply chain systems
- Third-party logistics APIs

**Scalability:**
- High-frequency transaction optimization
- Layer-2 scaling solutions
- Optimized gas cost strategies
- Production performance tuning

---

## 6. Users and Roles

### 6.1 Artisan / Producer

The artisan or producer is the creator of the handcrafted batch.

**Responsibilities:**
- Create and document batch information
- Obtain MINTER_ROLE authorization from admin
- Mint batch NFT on blockchain
- Upload batch metadata to IPFS
- Transfer custody to co-op or distributor
- Potentially record initial processing steps

**Required Skills:**
- Basic wallet management (MetaMask)
- Ability to provide product information
- Understanding of traceability concept

**User Journey:**
```
1. Connect MetaMask wallet
2. Fill batch information form
3. Upload product image
4. Confirm transaction
5. Receive token ID
6. Share QR code if needed
```

### 6.2 Co-op / Distributor / Retailer

These participants handle the product after it is created by the artisan.

**Responsibilities:**
- Receive custody of NFT from previous owner
- Record processing steps (if applicable)
  - Quality checks
  - Packaging
  - Natural dyeing
  - Repairs or modifications
- Record transportation steps
  - Shipment departure
  - Transit location
  - Delivery confirmation
- Transfer custody to next participant
- Ensure step information accuracy

**Required Skills:**
- Wallet management
- Understanding of blockchain transfers
- Careful documentation of events

**User Journey:**
```
1. Receive NFT transfer from previous owner
2. Connect MetaMask wallet as new owner
3. Enter step details (type, description, location, date)
4. Upload step information to IPFS
5. Confirm recordStep() transaction
6. Transfer custody when ready
```

### 6.3 Buyer

The buyer is the final holder of the batch and has full visibility into its history.

**Responsibilities:**
- Verify product authenticity before purchase
- Scan QR code or enter token ID
- Review batch history and chain of custody
- Make informed purchasing decisions
- Optionally retain the NFT as proof of ownership

**Required Skills:**
- QR code scanning (using smartphone)
- Basic web browser navigation
- Understanding of blockchain terms (optional)

**User Journey:**
```
1. Scan QR code on product packaging
2. View batch details page
3. Review ownership history
4. Review all processing steps
5. Verify metadata and origin
6. Confirm product authenticity
7. Make purchase decision
```

### 6.4 Admin / System Administrator

The administrator manages system configuration and role assignments.

**Responsibilities:**
- Deploy smart contract to Sepolia
- Configure contract parameters
- Grant MINTER_ROLE to authorized artisans
- Revoke roles if needed
- Monitor system health
- Update contract address in frontend

**Required Skills:**
- Hardhat and smart contract deployment
- Private key management
- Blockchain development
- Environment configuration

**User Journey:**
```
1. Configure private key and RPC URL
2. Deploy CraftBatch721 contract
3. Grant MINTER_ROLE to artisan addresses
4. Update frontend .env with contract address
5. Deploy frontend to Vercel
6. Monitor live application
```

---

## 7. Technology Stack

### 7.1 Frontend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | Next.js | 14.x | React metaframework |
| UI Library | React | 18.x | Component library |
| Language | TypeScript | 5.x | Type-safe JavaScript |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| Blockchain | ethers.js | 6.x | Ethereum interaction |
| QR Code | qrcode.react | 1.x | QR code generation |
| HTTP Client | Axios | 1.x | IPFS requests |
| PostCSS | PostCSS | 8.x | CSS processing |
| AutoPrefixer | AutoPrefixer | 10.x | Browser compatibility |

### 7.2 Blockchain Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Language | Solidity | 0.8.x | Smart contract code |
| Framework | Hardhat | 2.x | Development environment |
| NFT Standard | ERC-721 | OpenZeppelin | Non-fungible tokens |
| Access Control | AccessControl | OpenZeppelin | Role-based permissions |
| Contracts Lib | OpenZeppelin | 5.x | Battle-tested implementations |
| RPC Client | ethers.js | 6.x | Blockchain interaction |
| Environment | Node.js | 18+ | JavaScript runtime |
| Test Framework | Hardhat Test | Mocha/Chai | Unit and integration tests |

### 7.3 Infrastructure & Services

| Service | Provider | Purpose |
|---------|----------|---------|
| Blockchain | Ethereum Sepolia | Testnet for NFTs |
| RPC Provider | Alchemy | Node access and APIs |
| Storage | IPFS | Decentralized metadata storage |
| Pinning Service | Pinata or Filecoin | IPFS data persistence |
| Frontend Hosting | Vercel | Deployment and hosting |
| Version Control | GitHub | Source code management |
| Wallet | MetaMask | User transaction signing |

### 7.4 Development Tools

| Tool | Purpose |
|------|---------|
| Visual Studio Code | Code editor |
| Hardhat | Smart contract testing and deployment |
| Ethers.js | Blockchain RPC calls |
| Solidity | Smart contract language |
| TypeScript | Type checking |
| Git | Version control |
| npm | Package manager |
| Vercel CLI | Deployment tool |

---

## 8. System Architecture

### 8.1 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        END USERS                                 │
│  Artisan │ Co-op │ Retailer │ Buyer │ Admin                    │
└────────────────┬──────────────────────────────────────────────────┘
                 │
                 v
    ┌────────────────────────────┐
    │   Next.js Web Application   │
    │   (TypeScript + React)      │
    │                            │
    │  Pages:                    │
    │  - Dashboard              │
    │  - Mint Batch             │
    │  - Record Step            │
    │  - Batch Details          │
    │  - Timeline               │
    │                            │
    │  Components:              │
    │  - WalletConnect          │
    │  - MintForm               │
    │  - StepForm               │
    │  - BatchDetails           │
    │  - Timeline               │
    │  - QRCode                 │
    └────────────┬──────────────┘
                 │
        ┌────────┴─────────┐
        v                  v
   ┌─────────────────────────────────┐
   │   ethers.js v6                  │
   │   (Blockchain Interaction)      │
   │                                 │
   │  - Contract ABI               │
   │  - Transaction Signing        │
   │  - Event Listening            │
   │  - Address Validation         │
   └────────────┬────────────────────┘
                │
                v
    ┌────────────────────────────┐
    │  MetaMask Wallet Extension │
    │  - User Signatures         │
    │  - Network Switching       │
    │  - Account Management      │
    └────────────┬───────────────┘
                 │
                 v
    ┌────────────────────────────┐
    │  Alchemy RPC Endpoint      │
    │  (Sepolia testnet)         │
    │  - Transaction Broadcasting│
    │  - Event Logs              │
    │  - State Queries           │
    └────────────┬───────────────┘
                 │
                 v
    ╔════════════════════════════════════════╗
    ║  ETHEREUM SEPOLIA BLOCKCHAIN           ║
    ║                                        ║
    ║  ┌──────────────────────────────────┐  ║
    ║  │ CraftBatch721.sol Smart Contract │  ║
    ║  │                                  │  ║
    ║  │ Functions:                       │  ║
    ║  │ - mintBatch()                    │  ║
    ║  │ - recordStep()                   │  ║
    ║  │ - Standard ERC-721 functions    │  ║
    ║  │                                  │  ║
    ║  │ Events:                          │  ║
    ║  │ - Transfer (from ERC-721)       │  ║
    ║  │ - StepRecorded                  │  ║
    ║  │ - Approval (from ERC-721)       │  ║
    ║  └──────────────────────────────────┘  ║
    ║                                        ║
    ║  State:                                ║
    ║  - Token ownership                     ║
    ║  - Token metadata URIs                 ║
    ║  - Role assignments (MINTER_ROLE)     ║
    ║  - Step recording hashes               ║
    ║                                        ║
    ╚════════════════════════════════════════╝
                 │
        ┌────────┴─────────┐
        v                  v
    
    ┌──────────────────────────┐   ┌─────────────────────────┐
    │  IPFS (Decentralized    │   │  IPFS Pinning Service   │
    │  Storage Network)       │   │  (Pinata/Filecoin)     │
    │                         │   │                         │
    │  Data Stored:          │   │  - Persistence          │
    │  - Batch Metadata JSON │   │  - Redundancy           │
    │  - Product Images      │   │  - Long-term Archiving  │
    │  - Step JSON Objects   │   │                         │
    │  - Processing Details  │   │  CID: Qm...             │
    │                         │   │                         │
    │  URI Format:           │   └─────────────────────────┘
    │  ipfs://Qm...          │
    └──────────────────────────┘
```

### 8.2 Data Flow Diagrams

**Batch Minting Flow:**
```
User Input (Batch Info)
    ↓
Create JSON Metadata
    ↓
Upload Image to IPFS → Receive Image CID
    ↓
Create Metadata JSON with Image CID
    ↓
Upload Metadata JSON to IPFS → Receive Metadata CID
    ↓
Call mintBatch(metadataCID)
    ↓
Smart Contract:
  - Verify MINTER_ROLE
  - Mint ERC-721 token
  - Assign unique Token ID
  - Store metadata URI
  - Emit Transfer event
    ↓
Transaction Confirmed on Sepolia
    ↓
Display Token ID & TX Hash to User
```

**Step Recording Flow:**
```
Step Input (Description, Location, Type, Date)
    ↓
Create Step JSON
    ↓
Upload Step JSON to IPFS → Receive CID
    ↓
Calculate Cryptographic Hash of Step JSON
    ↓
Call recordStep(tokenId, stepHash)
    ↓
Smart Contract:
  - Verify caller is token owner
  - Verify token exists
  - Emit StepRecorded event with:
    * tokenId
    * actor (msg.sender)
    * stepHash
    * timestamp (block.timestamp)
    ↓
Transaction Confirmed on Sepolia
    ↓
Store Step CID in Frontend Cache (optional)
    ↓
Display Success Message & TX Hash
```

**Timeline Reconstruction Flow:**
```
User enters or scans Token ID
    ↓
Frontend queries blockchain for:
  1. Batch metadata URI (from tokenURI)
  2. Fetch metadata from IPFS
  3. Listen for all Transfer events for tokenId
  4. Listen for all StepRecorded events for tokenId
    ↓
Combine events chronologically:
  - Transfer events → Ownership changes
  - StepRecorded events → Processing steps
    ↓
For each StepRecorded event:
  - Retrieve step CID from cache or storage
  - Fetch step JSON from IPFS
  - Verify hash matches on-chain hash
    ↓
Display complete timeline:
  Minted → Transferred → Step → Transferred → ... → Current Owner
```

### 8.3 Smart Contract Architecture

```
CraftBatch721.sol
│
├── Inheritance
│   ├── ERC721 (OpenZeppelin)
│   └── AccessControl (OpenZeppelin)
│
├── State Variables
│   ├── bytes32 public constant MINTER_ROLE
│   └── mapping(uint256 => Step[]) stepRecords
│
├── Events
│   ├── StepRecorded(uint256 indexed tokenId, address indexed actor, bytes32 stepHash, uint256 timestamp)
│   └── (Inherited: Transfer, Approval, etc.)
│
├── Modifiers
│   └── onlyRole(MINTER_ROLE)
│
├── Functions
│   ├── constructor()
│   ├── mintBatch(address to, string memory uri)
│   ├── recordStep(uint256 tokenId, bytes32 stepHash)
│   ├── _beforeTokenTransfer()
│   ├── supportsInterface()
│   └── (Inherited: transfer, transferFrom, safeTransferFrom, etc.)
│
└── Access Control
    └── MINTER_ROLE
        ├── Can mint new batches
        ├── Only admin can grant
        └── Only admin can revoke
```

---

## 9. Smart Contract Specification

### 9.1 CraftBatch721.sol Overview

The `CraftBatch721.sol` contract is the core of the system. It is built on OpenZeppelin's battle-tested ERC-721 implementation.

**Contract Purpose:**
- Issue unique NFTs for product batches
- Manage token ownership (standard ERC-721)
- Record processing and transportation steps
- Emit verifiable events for the timeline
- Control minting through role-based access

### 9.2 Smart Contract Structs and Events

**StepRecorded Event:**
```solidity
event StepRecorded(
    uint256 indexed tokenId,
    address indexed actor,
    bytes32 stepHash,
    uint256 timestamp
);
```

| Field | Type | Purpose |
|-------|------|---------|
| `tokenId` | uint256 | Identifies the batch NFT |
| `actor` | address | Address recording the step (current owner) |
| `stepHash` | bytes32 | Cryptographic hash of step data (from IPFS) |
| `timestamp` | uint256 | Block timestamp of the event |

### 9.3 Smart Contract Functions

**Constructor:**
```solidity
constructor()
```
- Initializes ERC-721 with name "CraftBatch" and symbol "CRAFT"
- Initializes AccessControl
- Grants DEFAULT_ADMIN_ROLE to deployer
- Deployer can then grant MINTER_ROLE to authorized addresses

**Mint Batch:**
```solidity
function mintBatch(
    address to,
    string memory uri
) public onlyRole(MINTER_ROLE) returns (uint256)
```
- Requires: Caller has MINTER_ROLE
- Mints new ERC-721 token
- Assigns unique tokenId
- Sets token URI (points to IPFS metadata)
- Transfers token to `to` address
- Returns: New tokenId
- Emits: Transfer event

**Record Step:**
```solidity
function recordStep(
    uint256 tokenId,
    bytes32 stepHash
) public
```
- Requires: Caller is the current owner of tokenId
- Requires: tokenId exists
- Records step hash on-chain
- Emits: StepRecorded event with actor, hash, timestamp

**Standard ERC-721 Functions:**
```solidity
// These are inherited from OpenZeppelin ERC-721

// View ownership
function ownerOf(uint256 tokenId) public view returns (address)

// View metadata URI
function tokenURI(uint256 tokenId) public view returns (string memory)

// Transfer token
function transferFrom(address from, address to, uint256 tokenId) public

// Safe transfer with callback
function safeTransferFrom(address from, address to, uint256 tokenId) public

// Grant permissions for another address to transfer
function approve(address to, uint256 tokenId) public

// Check approved address
function getApproved(uint256 tokenId) public view returns (address)

// Set approval for all tokens
function setApprovalForAll(address operator, bool approved) public

// Check if operator approved for all
function isApprovedForAll(address owner, address operator) public view returns (bool)
```

### 9.4 Role-Based Access Control

**MINTER_ROLE:**
```solidity
bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
```

**Granting MINTER_ROLE (Admin only):**
```solidity
function grantRole(bytes32 role, address account) public onlyRole(DEFAULT_ADMIN_ROLE)
```

**Revoking MINTER_ROLE (Admin only):**
```solidity
function revokeRole(bytes32 role, address account) public onlyRole(DEFAULT_ADMIN_ROLE)
```

**Checking if address has MINTER_ROLE:**
```solidity
function hasRole(bytes32 role, address account) public view returns (bool)
```

### 9.5 Contract Deployment Details

**Network:** Ethereum Sepolia  
**Gas Considerations:** Approximately 2M gas for deployment  
**Constructor Parameters:** None (uses defaults)  
**Post-Deployment Steps:**
1. Deploy contract
2. Grant MINTER_ROLE to authorized artisans
3. Save contract address
4. Update frontend .env with contract address

---

## 10. Data Architecture

### 10.1 On-Chain Data Storage

The blockchain stores small, critical, and immutable information.

**What is stored on-chain:**
- Token ID (assigned by contract)
- Current owner address
- Token URI (points to IPFS metadata)
- Transfer events (who transferred token to whom and when)
- StepRecorded events (actor, stepHash, timestamp)
- Role assignments (MINTER_ROLE)

**Why:**
- Immutability — Cannot be altered retroactively
- Verification — Cryptographic proof
- Integrity — Single source of truth
- Accessibility — Available to all participants

### 10.2 Off-Chain Data Storage (IPFS)

Large and detailed information is stored on IPFS.

**Batch Metadata JSON:**
```json
{
  "name": "Handwoven Cotton Shawl",
  "description": "Premium handcrafted cotton product from Odisha artisans",
  "image": "ipfs://QmABC123...",
  "attributes": [
    {
      "trait_type": "Origin",
      "value": "Odisha, India"
    },
    {
      "trait_type": "Material",
      "value": "100% Pure Cotton"
    },
    {
      "trait_type": "Production Date",
      "value": "2026-09-26"
    },
    {
      "trait_type": "Artisan Name",
      "value": "Handcraft Cooperative"
    },
    {
      "trait_type": "Production Method",
      "value": "Handwoven"
    }
  ]
}
```

**Step JSON (Processing/Transportation):**
```json
{
  "stepType": "Processing",
  "description": "Natural dyeing with indigo completed",
  "location": "Odisha, India",
  "date": "2026-09-28T14:30:00Z",
  "actor": "Craft Cooperative",
  "notes": "Traditional hand-dyeing process",
  "qualityChecks": "Passed"
}
```

**Why IPFS:**
- Decentralized — No central point of failure
- Content-addressed — Data verified by hash
- Censorship-resistant — Cannot be removed by single entity
- Permanent archiving — Data persists indefinitely with pinning service
- Cost-effective — Storing on-chain would be prohibitively expensive

### 10.3 Data Verification Process

**Original Flow (Creation):**
```
Step JSON
    ↓
Calculate SHA-256 hash
    ↓
Upload to IPFS → Receive CID
    ↓
Store hash on-chain in StepRecorded event
    ↓
Store CID reference locally (optional)
```

**Verification Flow (Later):**
```
Retrieve step JSON from IPFS using CID
    ↓
Calculate SHA-256 hash
    ↓
Compare with on-chain hash
    ↓
Match? → Data is authentic
    ↓
No match? → Data has been tampered with
```

---

## 11. Frontend Pages and Components

### 11.1 Frontend Structure

```
frontend/
├── app/
│   ├── page.tsx              (Dashboard)
│   ├── layout.tsx            (Root layout)
│   ├── mint/
│   │   └── page.tsx          (Mint batch page)
│   ├── record-step/
│   │   └── page.tsx          (Record step page)
│   └── batch/
│       └── [tokenId]/
│           └── page.tsx      (Batch details page)
│
├── components/
│   ├── Navbar.tsx            (Navigation bar)
│   ├── WalletConnect.tsx      (MetaMask connection)
│   ├── MintForm.tsx           (Batch minting form)
│   ├── StepForm.tsx           (Step recording form)
│   ├── BatchDetails.tsx       (Batch info display)
│   ├── Timeline.tsx           (Event timeline)
│   └── QRCode.tsx             (QR code generator)
│
├── lib/
│   ├── contract.ts           (Contract config & ABI)
│   ├── blockchain.ts         (ethers.js utilities)
│   └── ipfs.ts               (IPFS integration)
│
└── public/
    └── images/               (Static assets)
```

### 11.2 Page Descriptions

**Dashboard (/):**
- Project overview and introduction
- "Connect Wallet" button
- Navigation to other pages
- Quick action cards
- Display connected wallet info (if connected)
- Show current network (Sepolia or wrong network alert)

**Mint Batch (/mint):**
- Form to enter batch information
- Batch name, description, origin, material, production date
- Image upload
- Submit button
- Loading state during IPFS upload
- Display transaction hash after minting
- Display new token ID
- "View Batch" button linking to batch details

**Record Step (/record-step):**
- Form to enter step information
- Token ID input (required)
- Step type selector (dropdown)
- Description textarea
- Location input
- Date/time picker
- Submit button
- Loading state during transaction
- Display transaction hash
- Success/error messages

**Batch Details (/batch/[tokenId]):**
- Display batch metadata from IPFS
- Show batch image
- Display batch attributes
- Show current owner address
- Show minting date/time
- Display complete timeline
- Show all transfer events
- Show all recorded steps with verification
- Display QR code linking to this page
- Copy token ID button
- "Transfer" button (if user is owner)
- Etherscan link for contract

### 11.3 Component Descriptions

**Navbar.tsx:**
- Display project name and logo
- Navigation links (Dashboard, Mint, Record Step)
- Display current wallet address (if connected)
- Display current network name
- Disconnect button

**WalletConnect.tsx:**
- MetaMask connection button
- Detect if wallet is installed
- Detect if connected to Sepolia
- Show error if wrong network
- Display wallet address
- Display connection status
- Handle connection errors

**MintForm.tsx:**
- Input fields for batch information
- Image file upload
- Form validation
- IPFS upload progress
- Transaction confirmation
- Error handling
- Loading states

**StepForm.tsx:**
- Token ID input validation
- Step type selector
- Description textarea
- Location input
- Date/time picker
- IPFS upload for step data
- Transaction confirmation
- Error handling

**BatchDetails.tsx:**
- Fetch and display batch metadata from IPFS
- Display batch attributes in a card
- Show current owner
- Verify IPFS data against on-chain hash
- Format dates and addresses
- Handle missing or corrupted data

**Timeline.tsx:**
- Fetch all Transfer events for token
- Fetch all StepRecorded events for token
- Sort chronologically
- Display each event as a timeline item
- Show timestamps, actors, and descriptions
- For steps, show verification status
- Hover effects showing more details

**QRCode.tsx:**
- Generate QR code containing batch URL
- Display QR code as image
- Provide download button
- Generate URL: `https://domain.com/batch/{tokenId}`
- Include in batch details page

---

## 12. API and Function Reference

### 12.1 Contract Functions Reference

**Smart Contract Address:**
```
0x... (to be updated after deployment)
```

**ABI Location:**
```
frontend/lib/contract.ts
```

**Function Reference:**

| Function | Visibility | Role Requirement | Purpose |
|----------|-----------|------------------|---------|
| `mintBatch(to, uri)` | Public | MINTER_ROLE | Mint new batch NFT |
| `recordStep(tokenId, hash)` | Public | Token owner | Record processing step |
| `transferFrom(from, to, id)` | Public | Token owner or approved | Transfer ownership |
| `safeTransferFrom(from, to, id)` | Public | Token owner or approved | Safe transfer with callback |
| `ownerOf(tokenId)` | View | None | Get current owner |
| `tokenURI(tokenId)` | View | None | Get IPFS metadata URI |
| `grantRole(role, account)` | Public | Admin | Grant role to address |
| `revokeRole(role, account)` | Public | Admin | Revoke role from address |

### 12.2 Frontend Library Functions

**blockchain.ts:**
```typescript
// Get contract instance
getContractInstance(provider)

// Check if address has MINTER_ROLE
async canMint(address)

// Mint batch
async mintBatch(to, metadataURI)

// Record step
async recordStep(tokenId, stepHash)

// Transfer token
async transferToken(to, tokenId)

// Get owner of token
async getTokenOwner(tokenId)

// Get token metadata URI
async getTokenURI(tokenId)

// Get all events for token
async getTokenEvents(tokenId)

// Get balance of address
async getBalance(address)
```

**contract.ts:**
```typescript
// Contract configuration
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_SEPOLIA_CHAIN_ID || '11155111')
export const CONTRACT_ABI = [...]

// Get provider and signer
getProvider()
getSigner()
```

**ipfs.ts:**
```typescript
// Upload file to IPFS
async uploadFile(file)

// Upload JSON to IPFS
async uploadJSON(data)

// Retrieve file from IPFS
async getIPFSContent(cid)

// Pin to IPFS service
async pinToIPFS(cid)

// Calculate file hash
calculateHash(data)
```

---

## 13. Security and Privacy

### 13.1 Smart Contract Security

**Access Control:**
- MINTER_ROLE restricts who can mint batches
- Only token owner can record steps
- Standard ERC-721 transfer mechanisms
- No unrestricted functions

**Input Validation:**
- Validate token ID exists before recordStep
- Verify caller is token owner
- Validate addresses are not zero
- Validate URI format

**Common Attack Vectors Mitigated:**
- **Unauthorized minting** — MINTER_ROLE required
- **Unauthorized step recording** — Token owner verification
- **Token theft** — Standard ERC-721 mechanisms (approval required)
- **Data tampering** — Cryptographic hashes verify integrity
- **Reentrancy** — ERC-721 uses non-reentrant mechanisms

### 13.2 Frontend Security

**Private Key Protection:**
- Never store private keys in code or localStorage
- Use MetaMask for transaction signing
- Environment variables for configuration only

**Environment Variables:**
- Never commit `.env.local` files
- Never expose `PRIVATE_KEY` through `NEXT_PUBLIC_` prefix
- Use `NEXT_PUBLIC_` only for public information

**Sensitive Information Handling:**
- No PII on blockchain
- No passwords or security credentials
- No financial information
- Validate all user inputs

### 13.3 Data Privacy

**On-Chain Data:**
- Minimalist approach — only essential data
- No personal information
- No sensitive business data
- All transactions publicly visible (expected)

**Off-Chain Data (IPFS):**
- No passwords or credentials
- No PII unless necessary for product metadata
- All IPFS data is public and permanent
- Assume all IPFS data can be seen by anyone

**IPFS Pinning Service:**
- Choose reputable provider (Pinata, Filecoin)
- Understand their terms of service
- Data is not deleted once pinned
- Long-term availability guaranteed

### 13.4 Transaction Security

**Wallet Security:**
- Use hardware wallets for production
- Backup seed phrases securely
- Use strong passwords
- Enable 2FA on wallet accounts

**Transaction Verification:**
- Display full transaction details before signing
- Show gas estimates clearly
- Verify contract address before signing
- Check network selection (Sepolia vs. Mainnet)

### 13.5 Error Handling and Recovery

**Transaction Failures:**
- Handle "user rejected" gracefully
- Handle "insufficient gas" errors
- Handle "network timeout" errors
- Provide clear error messages

**Data Integrity:**
- Verify IPFS data hash matches on-chain hash
- Validate JSON structure
- Handle missing or corrupted IPFS data
- Provide fallback views

---

## 14. Development Environment Setup

### 14.1 Prerequisites

**System Requirements:**
- Windows 10/11, macOS, or Linux
- 8GB RAM minimum
- 5GB free disk space
- Internet connection for RPC and IPFS

**Required Software:**
- Node.js (v18.0.0 or higher)
- npm (comes with Node.js)
- Git
- Visual Studio Code (recommended)
- MetaMask browser extension

### 14.2 Blockchain Development Setup

**1. Initialize Hardhat Project:**
```bash
cd blockchain

npm init -y

npm install --save-exact \
  @openzeppelin/contracts@5.0.0 \
  hardhat@2.22.0 \
  ethers@6.13.0

npm install --save-dev \
  @nomicfoundation/hardhat-toolbox@4.0.0 \
  @nomicfoundation/hardhat-ethers@3.0.0 \
  typescript@5.3.0 \
  ts-node@10.9.0 \
  dotenv@16.3.1 \
  @types/node@20.10.0

# Initialize Hardhat
npx hardhat

# Select: Create a TypeScript project
# Select: Yes for .gitignore
```

**2. Create Hardhat Configuration:**
File: `blockchain/hardhat.config.ts`

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
```

**3. Create .env File:**
File: `blockchain/.env`

```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=your_private_key_here
```

### 14.3 Frontend Development Setup

**1. Initialize Next.js Project:**
```bash
cd frontend

npm create next-app@14.0.0 . \
  --typescript \
  --tailwind \
  --eslint \
  --skip-git

# Or manually:
npm init -y

npm install --save-exact \
  next@14.0.0 \
  react@18.2.0 \
  react-dom@18.2.0 \
  ethers@6.13.0 \
  qrcode.react@1.0.1 \
  axios@1.6.0

npm install --save-dev \
  typescript@5.3.0 \
  @types/react@18.2.0 \
  @types/node@20.10.0 \
  tailwindcss@3.4.0 \
  postcss@8.4.0 \
  autoprefixer@10.4.0
```

**2. Create .env.local:**
File: `frontend/.env.local`

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_SEPOLIA_CHAIN_ID=11155111
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_here
```

**3. Configure Tailwind:**
File: `frontend/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
```

### 14.4 Alchemy Setup

**1. Create Alchemy Account:**
- Visit https://www.alchemy.com/
- Sign up for free account
- Create new app
- Select Ethereum → Sepolia
- Copy API key

**2. Update blockchain/.env:**
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

### 14.5 IPFS and Pinata Setup

**1. Create Pinata Account:**
- Visit https://www.pinata.cloud/
- Sign up (free tier available)
- Create API key
- Generate JWT

**2. Update frontend/.env.local:**
```
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_here
```

**3. Test IPFS Upload:**
```bash
cd frontend
npm run dev
# Visit http://localhost:3000 and test IPFS connectivity
```

### 14.6 MetaMask Wallet Setup

**1. Install MetaMask:**
- Visit https://metamask.io/
- Install browser extension
- Create wallet or import existing

**2. Add Sepolia Network:**
- Open MetaMask
- Click network selector
- Click "Add Network"
- Network Name: Sepolia
- RPC URL: https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
- Chain ID: 11155111
- Currency: ETH

**3. Get Test ETH:**
- Visit https://sepoliafaucet.com/
- Enter wallet address
- Receive test ETH

---

## 15. Deployment Instructions

### 15.1 Smart Contract Deployment

**1. Deploy to Sepolia:**
```bash
cd blockchain

# Compile contract
npx hardhat compile

# Deploy
npx hardhat run scripts/deploy.ts --network sepolia

# Output example:
# CraftBatch721 deployed to: 0x1234...
```

**2. Save Contract Address:**
- Note the deployed contract address
- Update frontend/.env.local
- Grant MINTER_ROLE to artisans

**3. Grant MINTER_ROLE:**
```bash
npx hardhat run scripts/grantRole.ts --network sepolia
# (Script to create for granting roles)
```

### 15.2 Frontend Deployment to Vercel

**1. Setup GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/craft-chain.git
git push -u origin main
```

**2. Deploy to Vercel:**
- Visit https://vercel.com/
- Sign up with GitHub
- Import project
- Add environment variables:
  ```
  NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
  NEXT_PUBLIC_SEPOLIA_CHAIN_ID=11155111
  NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
  ```
- Click Deploy

**3. Access Live Application:**
- Vercel provides URL
- Example: `craft-chain-[username].vercel.app`
- Share with users

---

## 16. Testing and Quality Assurance

### 16.1 Smart Contract Testing

**Test File:** `blockchain/test/CraftBatch721.test.ts`

**Test Cases:**

```typescript
describe("CraftBatch721", function () {
  // Test MINTER_ROLE restriction
  it("Should not allow non-minter to mint", async function () {
    expect(await contract.mintBatch(user, "ipfs://..."))
      .to.be.revertedWith("AccessControl");
  });

  // Test successful minting
  it("Should mint batch with correct token ID", async function () {
    const tx = await contract.mintBatch(artisan, "ipfs://QmABC");
    expect(await contract.ownerOf(1)).to.equal(artisan);
  });

  // Test token transfer
  it("Should transfer token correctly", async function () {
    await contract.safeTransferFrom(artisan, coop, 1);
    expect(await contract.ownerOf(1)).to.equal(coop);
  });

  // Test step recording
  it("Should record step only for token owner", async function () {
    await contract.recordStep(1, stepHash);
    // Verify event was emitted
  });

  // Test metadata URI
  it("Should store and return correct metadata URI", async function () {
    expect(await contract.tokenURI(1)).to.equal("ipfs://QmABC");
  });
});
```

**Run Tests:**
```bash
cd blockchain
npx hardhat test
```

### 16.2 Frontend Testing

**Manual Test Cases:**

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **Wallet Connection** | 1. Click Connect Wallet<br>2. Select MetaMask account<br>3. Approve connection | Wallet address displays, connected status shows |
| **Network Detection** | 1. Connect wallet on Mainnet<br>2. Switch to Sepolia | UI shows warning on Mainnet, accepts on Sepolia |
| **Mint Batch** | 1. Fill form with batch info<br>2. Upload image<br>3. Click Mint<br>4. Confirm in MetaMask<br>5. Wait for confirmation | Token ID displayed, TX hash shows, can view batch |
| **Record Step** | 1. Enter token ID<br>2. Fill step form<br>3. Click Record<br>4. Confirm in MetaMask<br>5. Wait for confirmation | TX hash displays, success message shows |
| **View Timeline** | 1. Enter token ID on batch page<br>2. Scroll down to timeline | All transfers and steps display chronologically |
| **QR Code** | 1. View batch details<br>2. Scan QR code with phone | Opens batch page in browser |
| **Transfer** | 1. On batch page, if you're owner<br>2. Click Transfer<br>3. Enter recipient address<br>4. Confirm in MetaMask | Ownership transfers, new owner can now record steps |

### 16.3 Pre-Deployment Checklist

```
[ ] Hardhat configuration correct
[ ] Smart contract compiles without errors
[ ] Smart contract tests pass (100%)
[ ] No hardcoded addresses in smart contract
[ ] Private keys not in git repository
[ ] SEPOLIA_RPC_URL is valid
[ ] Next.js builds without errors
[ ] Environment variables configured
[ ] MetaMask can connect
[ ] IPFS uploads work
[ ] Contract deployment successful
[ ] Contract address saved and updated
[ ] MINTER_ROLE granted to test accounts
[ ] Frontend deployed to Vercel
[ ] Live application loads
[ ] Wallet connection works on live site
[ ] Minting works end-to-end
[ ] Timeline displays correctly
[ ] QR code generates and works
[ ] No console errors in browser
[ ] Responsive design works on mobile
[ ] No sensitive data exposed in code
```

---

## 17. Troubleshooting Guide

### 17.1 Common Issues and Solutions

**Issue: "MetaMask not detected"**
- **Cause:** Browser extension not installed
- **Solution:** Install MetaMask from https://metamask.io/

**Issue: "Wrong network" message**
- **Cause:** MetaMask connected to Mainnet instead of Sepolia
- **Solution:** 
  1. Open MetaMask
  2. Click network selector
  3. Select Sepolia
  4. Refresh page

**Issue: "Insufficient gas"**
- **Cause:** Not enough Sepolia test ETH
- **Solution:** 
  1. Visit https://sepoliafaucet.com/
  2. Enter wallet address
  3. Request test ETH
  4. Wait for confirmation
  5. Retry transaction

**Issue: "MINTER_ROLE not granted"**
- **Cause:** Account not authorized to mint
- **Solution:**
  1. Use admin account
  2. Grant MINTER_ROLE to account
  3. Retry with authorized account

**Issue: "IPFS upload fails"**
- **Cause:** Pinata API key invalid or rate limited
- **Solution:**
  1. Verify Pinata JWT in .env.local
  2. Check Pinata account status
  3. Wait and retry
  4. Check console for error details

**Issue: "Contract address not found"**
- **Cause:** NEXT_PUBLIC_CONTRACT_ADDRESS not set or wrong
- **Solution:**
  1. Deploy contract (get address)
  2. Update frontend/.env.local
  3. Restart `npm run dev`
  4. Redeploy to Vercel if live

**Issue: "Timeline not loading"**
- **Cause:** Events not indexed yet, or query timeout
- **Solution:**
  1. Wait a few minutes
  2. Refresh page
  3. Check Alchemy dashboard for errors
  4. Verify RPC URL in hardhat.config.ts

---

## 18. Future Enhancements

### 18.1 Possible Improvements

**Phase 2 Features:**
- **Mobile App** — React Native or Flutter application
- **Advanced Analytics** — Supply chain metrics and dashboards
- **Batch Modification** — Ability to update batch metadata (with audit trail)
- **Multi-Sig Minting** — Require multiple approvals for sensitive batches
- **Automated Notifications** — Email/SMS when batch status changes
- **Batch Splitting** — Split batch into sub-batches
- **Advanced Verification** — Include proof-of-authenticity links

**Phase 3 Features:**
- **IoT Integration** — Automatic sensor-based step recording
- **GPS Tracking** — Location-based transportation tracking
- **Multi-Chain** — Support Polygon, Arbitrum, etc.
- **Inventory Management** — Track stock levels at each step
- **Cost Analytics** — Track costs throughout supply chain
- **Sustainability Data** — Carbon footprint, water usage, etc.

**Phase 4 Features:**
- **Enterprise Deployment** — Mainnet deployment
- **Compliance Suite** — GDPR, regulatory compliance
- **API Gateway** — Third-party integrations
- **DAO Governance** — Community-run contract updates
- **Insurance Integration** — Automated insurance claims

---

## 19. Conclusion

Craft-Chain demonstrates how blockchain and decentralized storage can be combined to create a transparent, verifiable, and tamper-proof traceability system for handcrafted product batches.

### Key Achievements

By representing each batch as an ERC-721 NFT and recording custody transfers and processing steps on Ethereum Sepolia, Craft-Chain provides:

1. **Permanent Record** — Immutable history of every batch
2. **Verifiable Origin** — Cryptographic proof of artisan
3. **Complete Transparency** — Any participant can view history
4. **Buyer Confidence** — QR code-based verification
5. **Accountable Supply Chain** — All participants traceable
6. **Cost-Effective** — IPFS storage reduces blockchain costs
7. **Decentralized** — No single entity controls the system

### Suitable Use Cases

- Handcrafted products (textiles, pottery, jewelry)
- Organic and artisanal food products
- Fair-trade certified goods
- Limited-edition collectibles
- High-value handmade items
- Ethical supply chain demonstration
- Academic projects and research

### Project Status

**Current Phase:** Development and Testing  
**Target Completion:** Ready for deployment  
**Testnet:** Ethereum Sepolia  
**Production Deployment:** Future scope  

This system is designed for demonstration and academic purposes. It provides a solid foundation for blockchain-based traceability and can be extended to production systems with appropriate scaling and compliance measures.

