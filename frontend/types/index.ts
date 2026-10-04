/**
 * Core type definitions for Craft-Chain DApp
 * Shared across frontend components, pages, and utilities
 */

/**
 * Batch metadata stored on IPFS
 * Represents the product batch information
 */
export interface BatchMetadata {
  name: string;
  description: string;
  image: string; // IPFS URI: ipfs://QmXXX
  attributes: BatchAttribute[];
}

/**
 * Individual attribute of a batch
 * Examples: Origin, Material, Production Date, etc.
 */
export interface BatchAttribute {
  trait_type: string;
  value: string;
}

/**
 * On-chain batch NFT data
 * Represents the current state of a batch token
 */
export interface BatchNFT {
  tokenId: number;
  owner: string;
  metadataURI: string;
  metadata?: BatchMetadata; // Loaded from IPFS
}

/**
 * Processing or transportation step in supply chain
 * Stored on IPFS with hash recorded on-chain
 */
export interface StepData {
  stepType:
    "Processing" | "Transportation" | "Quality Check" | "Packaging" | "Other";
  description: string;
  location: string;
  date: string; // ISO 8601 format
  actor?: string; // Human-readable name (optional)
  notes?: string;
  qualityChecks?: string;
}

/**
 * On-chain step record
 * References off-chain IPFS data via hash
 */
export interface OnChainStep {
  stepHash: string; // bytes32 from contract
  actor: string; // Address that recorded the step
  timestamp: number; // Unix timestamp from block
}

/**
 * Complete step with both on-chain and off-chain data
 */
export interface CompleteStep extends OnChainStep {
  stepData?: StepData; // Loaded from IPFS
  ipfsCID?: string; // IPFS content identifier
  hashVerified?: boolean; // Whether hash matches recalculated hash
}

/**
 * Transfer event in batch ownership history
 */
export interface OwnershipTransfer {
  from: string;
  to: string;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

/**
 * Timeline event - either a transfer or step
 */
export type TimelineEvent = {
  type: "transfer" | "step";
  timestamp: number;
  blockNumber?: number;
  transactionHash?: string;
} & (
  | {
      type: "transfer";
      from: string;
      to: string;
    }
  | {
      type: "step";
      step: CompleteStep;
    }
);

/**
 * Complete batch history and traceability information
 */
export interface BatchHistory {
  batch: BatchNFT;
  currentOwner: string;
  transfers: OwnershipTransfer[];
  steps: CompleteStep[];
  timeline: TimelineEvent[];
}

/**
 * Wallet connection state
 */
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string; // In wei
  isCorrectNetwork: boolean; // true if on Sepolia
}

/**
 * Transaction state for user feedback
 */
export type TransactionStatus = "idle" | "pending" | "success" | "error";

/**
 * Transaction result with receipt data
 */
export interface TransactionResult {
  status: TransactionStatus;
  hash?: string;
  blockNumber?: number;
  gasUsed?: string;
  error?: string;
}

/**
 * Mint batch form data
 */
export interface MintBatchFormData {
  batchName: string;
  description: string;
  origin: string;
  material: string;
  productionDate: string; // ISO 8601
  image: File | null;
}

/**
 * Step recording form data
 */
export interface RecordStepFormData {
  tokenId: number;
  stepType:
    "Processing" | "Transportation" | "Quality Check" | "Packaging" | "Other";
  description: string;
  location: string;
  date: string; // ISO 8601
  notes?: string;
  qualityChecks?: string;
}

/**
 * IPFS upload response
 */
export interface IPFSUploadResponse {
  cid: string; // IPFS content identifier
  url: string; // Full IPFS URI: ipfs://QmXXX or gateway URL
  size: number;
}

/**
 * API error response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * User role in the system
 */
export type UserRole =
  "admin" | "artisan" | "distributor" | "retailer" | "buyer" | "unknown";

/**
 * Contract configuration
 */
export interface ContractConfig {
  address: string;
  chainId: number;
  rpcUrl: string;
  ipfsGateway: string;
}

/**
 * Context type for wallet provider
 */
export interface WalletContextType {
  wallet: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
}

/**
 * Context type for contract interactions
 */
export interface ContractContextType {
  isLoading: boolean;
  error: string | null;
  mintBatch: (to: string, metadataURI: string) => Promise<string | null>;
  recordStep: (tokenId: number, stepHash: string) => Promise<string | null>;
  transferBatch: (to: string, tokenId: number) => Promise<string | null>;
  getBatchNFT: (tokenId: number) => Promise<BatchNFT | null>;
  getBatchHistory: (tokenId: number) => Promise<BatchHistory | null>;
  canMint: (address: string) => Promise<boolean>;
}

/**
 * Form validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Batch search/filter options
 */
export interface BatchFilterOptions {
  owner?: string;
  originalArtisan?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: "active" | "completed" | "burned";
}

/**
 * QR code data
 */
export interface QRCodeData {
  tokenId: number;
  url: string;
  timestamp: number;
}

/**
 * Network configuration
 */
export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/**
 * Available networks
 */
export const NETWORKS: Record<number, NetworkConfig> = {
  11155111: {
    name: "Sepolia",
    chainId: 11155111,
    rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/",
    explorerUrl: "https://sepolia.etherscan.io",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
};

/**
 * Step types available in the system
 */
export const STEP_TYPES = [
  "Processing",
  "Transportation",
  "Quality Check",
  "Packaging",
  "Other",
] as const;

/**
 * Default batch metadata when not loaded
 */
export const DEFAULT_BATCH_METADATA: BatchMetadata = {
  name: "Unknown Batch",
  description: "Batch metadata not available",
  image: "",
  attributes: [],
};

/**
 * Default wallet state
 */
export const DEFAULT_WALLET_STATE: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  balance: "0",
  isCorrectNetwork: false,
};

/**
 * Type guards
 */

export function isValidAddress(address: unknown): address is string {
  return typeof address === "string" && /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidTokenId(tokenId: unknown): tokenId is number {
  return typeof tokenId === "number" && tokenId > 0;
}

export function isValidStepHash(hash: unknown): hash is string {
  return typeof hash === "string" && /^0x[a-fA-F0-9]{64}$/.test(hash);
}

export function isBatchMetadata(obj: unknown): obj is BatchMetadata {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "name" in obj &&
    "description" in obj &&
    "image" in obj &&
    "attributes" in obj
  );
}

export function isStepData(obj: unknown): obj is StepData {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "stepType" in obj &&
    "description" in obj &&
    "location" in obj &&
    "date" in obj
  );
}
