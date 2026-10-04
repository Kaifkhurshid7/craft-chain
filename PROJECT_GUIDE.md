# Craft-Chain: Project Guide

Craft-Chain is a web app that records the journey of handcrafted product batches on the blockchain, so anyone can check where a product came from and who handled it.

This guide explains how the project works and how to run and use it. For deeper detail, see [README.md](README.md).

---

## 1. What it does

- An **artisan** registers a batch of products. The batch becomes an NFT (ERC-721 token) on the Ethereum Sepolia testnet.
- The batch's details (name, description, origin, material, production date, photo) are stored on **IPFS**. The token points to them.
- Whoever holds the batch can **record journey steps** (processing, transport, inspection and so on) on-chain.
- A **buyer** opens the batch page, or scans its QR code, to see the owner, the details and the full chain of custody.

A batch is shown as **Verified** once at least one step has been recorded on-chain.

---

## 2. How it works

```
 Browser (Next.js app)
   │  mint / record step (MetaMask signs the transaction)
   ├──────────────────────────────► Sepolia blockchain: CraftBatch721 contract
   │                                  token, owner, metadata link, step hashes
   │  upload image + metadata
   └──► /api/ipfs/* (server routes) ──► Pinata / IPFS: images and metadata JSON
                                         (the Pinata key stays on the server)
```

| Part | Where it lives | What it stores |
|---|---|---|
| Ownership, token ID, metadata link, step hashes, who recorded a step and when | Blockchain (smart contract) | Small, permanent, public data |
| Batch name, description, origin, material, photo | IPFS (via Pinata) | Larger data that is too costly to keep on-chain |

Reading data (home, explorer, batch pages) needs no wallet. The app reads the contract through an RPC URL. Writing data (minting, recording steps) needs MetaMask on Sepolia.

### Project layout

```
craft-chain/
├── blockchain/        Hardhat project: smart contract, tests, deploy script
│   ├── contracts/CraftBatch721.sol
│   ├── scripts/deploy.ts
│   └── test/
└── frontend/          Next.js 14 app (TypeScript, Tailwind CSS)
    ├── app/           Pages and the /api/ipfs server routes
    ├── components/    UI components
    ├── context/       Wallet and contract providers
    ├── hooks/         Form validation, transaction status, batch registry
    └── lib/           Blockchain, IPFS and error-handling helpers
```

### The smart contract

`CraftBatch721` is an ERC-721 contract with role-based access:

| Action | Who can do it |
|---|---|
| `mintBatch(to, metadataURI)` | Accounts with `MINTER_ROLE` |
| `recordStep(tokenId, stepHash)` | **The current owner** of that token only |
| `getBatchSteps`, `getStepCount`, `getStep`, `tokenURI`, `ownerOf` | Anyone (read-only) |
| Grant or revoke roles | The admin (the account that deployed the contract) |

Token IDs start at 1 and increase by one. The deployer receives only the admin role, so **the deployer must grant `MINTER_ROLE` to any account that should mint**, including itself.

---

## 3. Pages

| Page | URL | Wallet needed | Purpose |
|---|---|---|---|
| Home | `/` | No | Overview, live stats and the newest batch's recent steps |
| Explorer | `/explorer` | No | Search and filter every registered batch |
| Batch detail | `/batch/<tokenId>` | No | Product info, chain of custody, QR code, links to Etherscan and IPFS |
| Studio: Mint | `/mint` | Yes | Create a new batch |
| Studio: Record step | `/record-step` | Yes | Add a journey step to a batch you own |

---

## 4. Setup

### Requirements

- Node.js 18 or newer
- MetaMask browser extension
- A Sepolia RPC URL (for example from Alchemy)
- A Pinata account and API JWT (for IPFS uploads)
- Sepolia test ETH for gas (from any Sepolia faucet)

### Install

```bash
cd blockchain && npm install
cd ../frontend && npm install
```

### Deploy the contract (once)

Create `blockchain/.env` (use `blockchain/.env.example` as the template):

```
SEPOLIA_RPC_URL=<your Sepolia RPC URL>
PRIVATE_KEY=<deployer wallet private key>
ETHERSCAN_API_KEY=<optional, for verification>
```

Then run:

```bash
cd blockchain
npm run compile
npm test
npm run deploy:sepolia
```

Copy the printed contract address. Never commit `.env` or share your private key.

### Give an account permission to mint

The deployer is only the admin. Grant `MINTER_ROLE` to the wallet that will mint, using the Hardhat console or Etherscan's "Write contract" tab:

```
grantRole(MINTER_ROLE, <minter wallet address>)
```

`MINTER_ROLE` is `keccak256("MINTER_ROLE")`; the contract exposes it as the `MINTER_ROLE()` read function.

### Configure the frontend

Create `frontend/.env.local` (template: `frontend/.env.example`):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Address from the deploy step |
| `NEXT_PUBLIC_SEPOLIA_CHAIN_ID` | `11155111` |
| `NEXT_PUBLIC_ALCHEMY_RPC_URL` | Your Sepolia RPC URL |
| `NEXT_PUBLIC_IPFS_GATEWAY` | `https://gateway.pinata.cloud/ipfs/` |
| `PINATA_JWT` | Your Pinata JWT (server-only; **no** `NEXT_PUBLIC_` prefix) |

`PINATA_JWT` must not start with `NEXT_PUBLIC_`, otherwise it would be exposed in the browser.

### Run

```bash
cd frontend
npm run dev
```

Open http://localhost:3000.

---

## 5. How to use it

### Mint a batch

1. Open **Studio** (`/mint`) and connect MetaMask. Switch to Sepolia if asked.
2. Fill in batch name, description (10 characters or more), origin, material, production date and a photo (JPEG, PNG, GIF or WebP, up to 5 MB).
3. Click **Mint Batch** and confirm the transaction in MetaMask.
4. When the status panel reaches **Success**, the card shows the new token ID and the transaction hash. Use **View batch** to open it.

The wallet you mint with must have `MINTER_ROLE` and some Sepolia ETH.

### Record a journey step

1. Open the **Record Journey Step** tab (`/record-step`) with the wallet that **currently owns** the batch.
2. Enter the token ID, choose a step type, describe what happened, and add the location and date.
3. Click **Record Journey Step** and confirm in MetaMask.

Only the token's owner can record steps. After a transfer, the new owner takes over.

### Explore and verify

- **Explorer** (`/explorer`): search by token ID, name, origin or material, and filter by origin, material and status.
- **Batch page** (`/batch/<id>`): shows the owner, product details, the chain of custody, and a QR code. **Download QR Code** saves a code you can print on the product. Scanning it opens the same page.
- Every transaction link opens Etherscan, so anyone can check the record independently.

---

## 6. Useful commands

| Where | Command | What it does |
|---|---|---|
| `blockchain/` | `npm run compile` | Compile the contract |
| `blockchain/` | `npm test` | Run the 41 contract tests |
| `blockchain/` | `npm run node` | Start a local Hardhat chain |
| `blockchain/` | `npm run deploy:sepolia` | Deploy to Sepolia |
| `frontend/` | `npm run dev` | Start the dev server |
| `frontend/` | `npm run build` | Production build |
| `frontend/` | `npm run lint` | Lint the code |
| `frontend/` | `npm run type-check` | TypeScript check |
| `frontend/` | `npm run format` | Format with Prettier |

---

## 7. Deploying the frontend (Vercel)

1. Import the repository in Vercel and set **Root Directory** to `frontend`. Leave the build settings at their defaults.
2. Add the environment variables from section 4, using `PINATA_JWT` (not `NEXT_PUBLIC_PINATA_JWT`).
3. Deploy. The `/api/ipfs/*` routes run as serverless functions, so no separate backend is needed.

Note: Vercel's free plan rejects request bodies over about 4.5 MB, so photos between 4.5 and 5 MB will fail to upload there.

---

## 8. Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| Explorer or home shows an error or stays empty | Check `NEXT_PUBLIC_CONTRACT_ADDRESS` and `NEXT_PUBLIC_ALCHEMY_RPC_URL`. Restart `npm run dev` after editing `.env.local`. |
| "Wrong Network" in the navbar | Switch MetaMask to Sepolia, or use the switch button in the wallet panel. |
| Mint transaction fails | The wallet probably lacks `MINTER_ROLE`, or has no Sepolia ETH. |
| Recording a step fails | The connected wallet is not the current owner of that token. |
| Upload fails ("IPFS upload is not configured") | `PINATA_JWT` is missing or wrong. Restart the dev server after changing it. |
| Image does not show | The IPFS gateway may be slow or down. Try again later. |

---

## 9. Known limitations

- Step type, description and location are saved to IPFS when you record a step, but the batch page currently shows only the on-chain step data (who recorded it, when, and its hash), because the step's IPFS link is not stored on-chain.
- The explorer finds batches by checking token IDs one after another, up to 120. It will slow down with a very large registry.
- The contract supports standard ERC-721 transfers, but the app has no transfer page yet.
- The app is built for the Sepolia testnet and is not audited for production use with real value.

---

## 10. Security notes

- Keep `PRIVATE_KEY` and `PINATA_JWT` out of git. Both `.env` files are already git-ignored.
- Anything starting with `NEXT_PUBLIC_` is visible to every visitor. Never put a secret in such a variable.
- Use a dedicated test wallet for deploying, not a wallet that holds real funds.
