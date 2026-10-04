/**
 * Blockchain interaction utilities using ethers.js v6
 * Provides helper functions for common blockchain operations
 */

import {
  ethers,
  BrowserProvider,
  Contract,
  ContractTransactionResponse,
} from "ethers";
import { isValidAddress, isValidTokenId, isValidStepHash } from "@/types";
import { CRAFT_BATCH_ABI, getContractConfig } from "./contract";
import {
  parseBlockchainError,
  parseNetworkError,
  TransactionError,
  WalletError,
  GasError,
  NetworkError,
  PermissionError,
  NotFoundError,
  ValidationError,
} from "./errors";
import { logError, logWarn, logDebug } from "./errorLogger";

/**
 * Get ethers provider for Sepolia testnet
 */
export function getProvider(): BrowserProvider {
  if (!window.ethereum) {
    throw new WalletError(
      "MetaMask not found",
      "MetaMask is not installed. Please install MetaMask extension to use this application."
    );
  }
  return new BrowserProvider(window.ethereum);
}

/**
 * Get contract instance with signer
 */
export async function getContractWithSigner(
  signerOrProvider?: BrowserProvider
): Promise<Contract> {
  const config = getContractConfig();
  const provider = signerOrProvider || getProvider();

  let signer = null;
  try {
    signer = await provider.getSigner();
  } catch (error) {
    logWarn("No signer available, using provider for read-only access", error);
    throw new WalletError(
      "Unable to get signer from wallet",
      "Could not access your wallet. Please ensure MetaMask is connected and try again."
    );
  }

  const contractSigner = signer || provider;
  return new Contract(config.address, CRAFT_BATCH_ABI, contractSigner);
}

/**
 * Get contract instance (read-only)
 */
export function getContractReadOnly(): Contract {
  const config = getContractConfig();
  const provider = getProvider();
  return new Contract(config.address, CRAFT_BATCH_ABI, provider);
}

/**
 * Get current connected wallet address
 */
export async function getConnectedAddress(): Promise<string | null> {
  try {
    const provider = getProvider();
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch (error) {
    logDebug("Failed to get connected address", { error: String(error) });
    return null;
  }
}

/**
 * Get current chain ID
 */
export async function getChainId(): Promise<number> {
  const provider = getProvider();
  const network = await provider.getNetwork();
  return Number(network.chainId);
}

/**
 * Check if connected to Sepolia testnet
 */
export async function isOnSepolia(): Promise<boolean> {
  try {
    const chainId = await getChainId();
    return chainId === 11155111;
  } catch (error) {
    logError("Failed to check if on Sepolia", error);
    return false;
  }
}

/**
 * Switch to Sepolia network via MetaMask
 */
export async function switchToSepolia(): Promise<void> {
  if (!window.ethereum) {
    throw new WalletError(
      "MetaMask not found",
      "MetaMask is not installed. Please install MetaMask extension."
    );
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }], // 11155111 in hex
    });
    logDebug("Successfully switched to Sepolia network");
  } catch (error: unknown) {
    const switchError = error as {
      code: number;
      data?: { chainId: string };
      message?: string;
    };

    // Chain not added to MetaMask, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xaa36a7",
              chainName: "Sepolia Testnet",
              rpcUrls: ["https://eth-sepolia.g.alchemy.com/v2/demo"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
              nativeCurrency: {
                name: "Sepolia Ether",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
        logDebug("Successfully added Sepolia network to MetaMask");
      } catch (addError) {
        logError("Failed to add Sepolia network", addError);
        throw new WalletError(
          "Failed to add Sepolia network",
          "Could not add Sepolia network to MetaMask. Please try again."
        );
      }
    } else if (switchError.code === 4901) {
      throw new WalletError(
        "Sepolia network not found",
        "Sepolia network is not available in your MetaMask. Please add it manually."
      );
    } else {
      logError("Failed to switch to Sepolia", error);
      throw new WalletError(
        `Failed to switch network: ${switchError.message || "Unknown error"}`,
        "Could not switch to Sepolia network. Please try again or switch manually in MetaMask."
      );
    }
  }
}

/**
 * Get wallet balance in Wei
 */
export async function getBalance(address: string): Promise<string> {
  if (!isValidAddress(address)) {
    throw new ValidationError(
      "Invalid address format",
      "Please provide a valid Ethereum address.",
      { field: "address" }
    );
  }

  try {
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    return balance.toString();
  } catch (error) {
    logError("Failed to get balance", error);
    throw parseNetworkError(error);
  }
}

/**
 * Estimate gas for a transaction
 */
export async function estimateGas(
  functionName: string,
  params: unknown[]
): Promise<bigint> {
  try {
    const contract = await getContractWithSigner();
    const gasEstimate = await contract[functionName].estimateGas(...params);
    logDebug("Gas estimate calculated", {
      functionName,
      gasEstimate: gasEstimate.toString(),
    });
    // Add 20% buffer to account for state changes
    return (gasEstimate * BigInt(120)) / BigInt(100);
  } catch (error) {
    logWarn("Gas estimation failed, using default", error);
    // Return a reasonable default if estimation fails
    return BigInt(500000);
  }
}

/**
 * Check if wallet has sufficient gas
 */
export async function hasSufficientGas(requiredGas: bigint): Promise<boolean> {
  try {
    const address = await getConnectedAddress();
    if (!address) {
      throw new WalletError(
        "Not connected",
        "Please connect your wallet first."
      );
    }

    const balance = await getBalance(address);
    const balanceBigInt = BigInt(balance);

    const provider = getProvider();
    const gasPrice = (await provider.getFeeData()).gasPrice ?? BigInt(0);
    const requiredEth = requiredGas * gasPrice;

    const hasSufficient = balanceBigInt >= requiredEth;
    logDebug("Checked gas sufficiency", {
      balance: balance,
      requiredGas: requiredGas.toString(),
      gasPrice: gasPrice.toString(),
      requiredEth: requiredEth.toString(),
      sufficient: hasSufficient,
    });

    return hasSufficient;
  } catch (error) {
    logError("Failed to check gas sufficiency", error);
    // If we can't verify, assume insufficient
    return false;
  }
}

/**
 * Parse ETH to Wei
 */
export function parseEth(eth: string): bigint {
  return ethers.parseEther(eth);
}

/**
 * Mint a new batch NFT
 * @param to Recipient address
 * @param metadataURI IPFS URI pointing to batch metadata
 * @returns Transaction hash
 */
export async function mintBatch(
  to: string,
  metadataURI: string
): Promise<string> {
  if (!isValidAddress(to)) {
    throw new ValidationError(
      "Invalid recipient address",
      "Please enter a valid Ethereum address.",
      { field: "to" }
    );
  }

  if (!metadataURI || metadataURI.length === 0) {
    throw new ValidationError(
      "Metadata URI cannot be empty",
      "Metadata URI is required to mint a batch.",
      { field: "metadataURI" }
    );
  }

  if (!metadataURI.startsWith("ipfs://")) {
    throw new ValidationError(
      "Invalid metadata URI format",
      "Metadata URI must be in IPFS format (ipfs://...).",
      { field: "metadataURI" }
    );
  }

  try {
    logDebug("Starting mintBatch transaction", { to, metadataURI });

    const onSepolia = await isOnSepolia();
    if (!onSepolia) {
      throw new NetworkError(
        "Not on Sepolia network",
        "Please switch to Sepolia testnet in MetaMask to continue."
      );
    }

    const contract = await getContractWithSigner();
    let gasEstimate;
    try {
      gasEstimate = await contract.mintBatch.estimateGas(to, metadataURI);
      gasEstimate = (gasEstimate * BigInt(120)) / BigInt(100);
      logDebug("Gas estimate for mintBatch", {
        gasEstimate: gasEstimate.toString(),
      });
    } catch (gasError) {
      logWarn("Gas estimation failed, using default", gasError);
      gasEstimate = BigInt(500000);
    }

    const hasSufficient = await hasSufficientGas(gasEstimate);
    if (!hasSufficient) {
      throw new GasError(
        "Insufficient gas/ETH balance",
        "You don't have enough ETH to cover gas fees. Please get some testnet ETH from a faucet.",
        { recoverable: true }
      );
    }

    const tx: ContractTransactionResponse | null = await contract.mintBatch(
      to,
      metadataURI,
      {
        gasLimit: gasEstimate,
      }
    );

    if (!tx) {
      throw new TransactionError(
        "Transaction creation failed",
        "Failed to create the transaction. Please try again.",
        { recoverable: true }
      );
    }

    logDebug("Transaction submitted", { txHash: tx.hash });

    const receipt = await tx.wait(1); // Wait for 1 confirmation
    if (!receipt) {
      throw new TransactionError(
        "Transaction receipt not found",
        "Transaction was submitted but receipt could not be confirmed. Please check Etherscan.",
        {
          recoverable: true,
          suggestedAction:
            "Check transaction status on Etherscan using the transaction hash.",
        }
      );
    }

    logDebug("Transaction confirmed", {
      blockNumber: receipt.blockNumber,
      txHash: receipt.hash,
    });
    return receipt.hash;
  } catch (error) {
    // Check if it's already an AppError
    if (error instanceof Error && error.constructor.name.includes("Error")) {
      // Re-throw if it's already our custom error
      if (
        error.constructor.name.startsWith("Validation") ||
        error.constructor.name.startsWith("Network") ||
        error.constructor.name.startsWith("Transaction") ||
        error.constructor.name.startsWith("Gas")
      ) {
        throw error;
      }
    }

    logError("mintBatch failed", error, { to, metadataURI });
    throw parseBlockchainError(error);
  }
}

/**
 * Record a supply chain step
 * @param tokenId Batch token ID
 * @param stepHash SHA-256 hash of step data
 * @returns Transaction hash
 */
export async function recordStep(
  tokenId: number,
  stepHash: string
): Promise<string> {
  if (!isValidTokenId(tokenId)) {
    throw new ValidationError(
      "Invalid token ID",
      "Please enter a valid token ID.",
      { field: "tokenId" }
    );
  }

  if (!isValidStepHash(stepHash)) {
    throw new ValidationError(
      "Invalid step hash format",
      "Step hash must be a valid 32-byte hex string.",
      { field: "stepHash" }
    );
  }

  try {
    logDebug("Starting recordStep transaction", { tokenId, stepHash });

    const onSepolia = await isOnSepolia();
    if (!onSepolia) {
      throw new NetworkError(
        "Not on Sepolia network",
        "Please switch to Sepolia testnet in MetaMask."
      );
    }

    const contract = await getContractWithSigner();
    const currentAddress = await getConnectedAddress();
    if (!currentAddress) {
      throw new WalletError(
        "Wallet not connected",
        "Please connect your wallet first."
      );
    }

    try {
      const owner = await contract.ownerOf(tokenId);
      if (owner.toLowerCase() !== currentAddress.toLowerCase()) {
        throw new PermissionError(
          `Caller is not token owner: ${currentAddress} vs ${owner}`,
          "Only the current batch owner can record steps."
        );
      }
    } catch (ownerError: unknown) {
      const err = ownerError as { message?: string };
      if (err.message?.includes("does not exist")) {
        throw new NotFoundError(
          `Token ${tokenId} does not exist`,
          `Batch NFT with ID ${tokenId} does not exist.`
        );
      }
      throw ownerError;
    }

    let gasEstimate;
    try {
      gasEstimate = await contract.recordStep.estimateGas(tokenId, stepHash);
      gasEstimate = (gasEstimate * BigInt(120)) / BigInt(100);
      logDebug("Gas estimate for recordStep", {
        gasEstimate: gasEstimate.toString(),
      });
    } catch (gasError) {
      logWarn("Gas estimation failed, using default", gasError);
      gasEstimate = BigInt(300000);
    }

    const hasSufficient = await hasSufficientGas(gasEstimate);
    if (!hasSufficient) {
      throw new GasError(
        "Insufficient gas/ETH balance",
        "You don't have enough ETH to cover gas fees.",
        { recoverable: true }
      );
    }

    const tx: ContractTransactionResponse | null = await contract.recordStep(
      tokenId,
      stepHash,
      { gasLimit: gasEstimate }
    );

    if (!tx) {
      throw new TransactionError(
        "Transaction creation failed",
        "Failed to create the transaction. Please try again.",
        { recoverable: true }
      );
    }

    logDebug("Transaction submitted", { txHash: tx.hash });

    const receipt = await tx.wait(1);
    if (!receipt) {
      throw new TransactionError(
        "Transaction receipt not found",
        "Transaction was submitted but receipt could not be confirmed.",
        { recoverable: true }
      );
    }

    logDebug("Transaction confirmed", { blockNumber: receipt.blockNumber });
    return receipt.hash;
  } catch (error) {
    // Check if it's already an AppError
    if (error instanceof Error && error.constructor.name.includes("Error")) {
      if (
        error.constructor.name.startsWith("Validation") ||
        error.constructor.name.startsWith("Network") ||
        error.constructor.name.startsWith("Transaction") ||
        error.constructor.name.startsWith("Gas") ||
        error.constructor.name.startsWith("Permission") ||
        error.constructor.name.startsWith("Wallet") ||
        error.constructor.name.startsWith("NotFound")
      ) {
        throw error;
      }
    }

    logError("recordStep failed", error, { tokenId });
    throw parseBlockchainError(error);
  }
}

/**
 * Transfer batch ownership to another address
 * @param to Recipient address
 * @param tokenId Batch token ID
 * @returns Transaction hash
 */
export async function transferBatch(
  to: string,
  tokenId: number
): Promise<string> {
  if (!isValidAddress(to)) {
    throw new ValidationError(
      "Invalid recipient address",
      "Please enter a valid Ethereum address.",
      { field: "to" }
    );
  }

  if (!isValidTokenId(tokenId)) {
    throw new ValidationError(
      "Invalid token ID",
      "Please enter a valid token ID.",
      { field: "tokenId" }
    );
  }

  try {
    logDebug("Starting transferBatch transaction", { to, tokenId });

    const onSepolia = await isOnSepolia();
    if (!onSepolia) {
      throw new NetworkError(
        "Not on Sepolia network",
        "Please switch to Sepolia testnet in MetaMask."
      );
    }

    const fromAddress = await getConnectedAddress();
    if (!fromAddress) {
      throw new WalletError(
        "Wallet not connected",
        "Please connect your wallet first."
      );
    }

    if (fromAddress.toLowerCase() === to.toLowerCase()) {
      throw new ValidationError(
        "Cannot transfer to self",
        "Please select a different address to transfer to.",
        { field: "to" }
      );
    }

    const contract = await getContractWithSigner();
    try {
      const owner = await contract.ownerOf(tokenId);
      if (owner.toLowerCase() !== fromAddress.toLowerCase()) {
        throw new PermissionError(
          `Caller is not token owner: ${fromAddress} vs ${owner}`,
          "Only the current batch owner can transfer the batch."
        );
      }
    } catch (ownerError: unknown) {
      const err = ownerError as { message?: string };
      if (err.message?.includes("does not exist")) {
        throw new NotFoundError(
          `Token ${tokenId} does not exist`,
          `Batch NFT with ID ${tokenId} does not exist.`
        );
      }
      throw ownerError;
    }

    let gasEstimate;
    try {
      gasEstimate = await contract.safeTransferFrom.estimateGas(
        fromAddress,
        to,
        tokenId
      );
      gasEstimate = (gasEstimate * BigInt(120)) / BigInt(100);
      logDebug("Gas estimate for transfer", {
        gasEstimate: gasEstimate.toString(),
      });
    } catch (gasError) {
      logWarn("Gas estimation failed, using default", gasError);
      gasEstimate = BigInt(300000);
    }

    const hasSufficient = await hasSufficientGas(gasEstimate);
    if (!hasSufficient) {
      throw new GasError(
        "Insufficient gas/ETH balance",
        "You don't have enough ETH to cover gas fees.",
        { recoverable: true }
      );
    }

    const tx: ContractTransactionResponse | null =
      await contract.safeTransferFrom(fromAddress, to, tokenId, {
        gasLimit: gasEstimate,
      });

    if (!tx) {
      throw new TransactionError(
        "Transaction creation failed",
        "Failed to create the transaction. Please try again.",
        { recoverable: true }
      );
    }

    logDebug("Transaction submitted", { txHash: tx.hash });

    const receipt = await tx.wait(1);
    if (!receipt) {
      throw new TransactionError(
        "Transaction receipt not found",
        "Transaction was submitted but receipt could not be confirmed.",
        { recoverable: true }
      );
    }

    logDebug("Transaction confirmed", { blockNumber: receipt.blockNumber });
    return receipt.hash;
  } catch (error) {
    // Check if it's already an AppError
    if (error instanceof Error && error.constructor.name.includes("Error")) {
      if (
        error.constructor.name.startsWith("Validation") ||
        error.constructor.name.startsWith("Network") ||
        error.constructor.name.startsWith("Transaction") ||
        error.constructor.name.startsWith("Gas") ||
        error.constructor.name.startsWith("Permission") ||
        error.constructor.name.startsWith("Wallet") ||
        error.constructor.name.startsWith("NotFound")
      ) {
        throw error;
      }
    }

    logError("transferBatch failed", error, { to, tokenId });
    throw parseBlockchainError(error);
  }
}

/**
 * Get batch owner address
 * @param tokenId Token ID to check
 * @returns Owner address
 */
export async function getBatchOwner(tokenId: number): Promise<string> {
  if (!isValidTokenId(tokenId)) {
    throw new ValidationError(
      "Invalid token ID",
      "Please enter a valid token ID.",
      { field: "tokenId" }
    );
  }

  try {
    const contract = getContractReadOnly();
    return await contract.ownerOf(tokenId);
  } catch (error: unknown) {
    const err = error as { reason?: string; message?: string };
    if (
      err.reason?.includes("does not exist") ||
      err.message?.includes("does not exist")
    ) {
      throw new NotFoundError(
        `Token ${tokenId} does not exist`,
        `Batch NFT with ID ${tokenId} does not exist.`
      );
    }
    logError("getBatchOwner failed", error, { tokenId });
    throw parseBlockchainError(error);
  }
}

/**
 * Get batch metadata URI
 * @param tokenId Token ID to query
 * @returns IPFS metadata URI
 */
export async function getBatchMetadataURI(tokenId: number): Promise<string> {
  if (!isValidTokenId(tokenId)) {
    throw new ValidationError(
      "Invalid token ID",
      "Please enter a valid token ID.",
      { field: "tokenId" }
    );
  }

  try {
    const contract = getContractReadOnly();
    return await contract.tokenURI(tokenId);
  } catch (error: unknown) {
    const err = error as { reason?: string; message?: string };
    if (
      err.reason?.includes("does not exist") ||
      err.message?.includes("does not exist")
    ) {
      throw new NotFoundError(
        `Token ${tokenId} does not exist`,
        `Batch NFT with ID ${tokenId} does not exist.`
      );
    }
    logError("getBatchMetadataURI failed", error, { tokenId });
    throw parseBlockchainError(error);
  }
}

/**
 * Get all steps recorded for a batch
 * @param tokenId Token ID to query
 * @returns Array of step records
 */
export async function getBatchSteps(
  tokenId: number
): Promise<Array<{ stepHash: string; actor: string; timestamp: bigint }>> {
  if (!isValidTokenId(tokenId)) {
    throw new ValidationError(
      "Invalid token ID",
      "Please enter a valid token ID.",
      { field: "tokenId" }
    );
  }

  try {
    const contract = getContractReadOnly();
    return await contract.getBatchSteps(tokenId);
  } catch (error: unknown) {
    const err = error as { reason?: string; message?: string };
    if (
      err.reason?.includes("does not exist") ||
      err.message?.includes("does not exist")
    ) {
      throw new NotFoundError(
        `Token ${tokenId} does not exist`,
        `Batch NFT with ID ${tokenId} does not exist.`
      );
    }
    logError("getBatchSteps failed", error, { tokenId });
    throw parseBlockchainError(error);
  }
}

/**
 * Get step count for a batch
 * @param tokenId Token ID to query
 * @returns Number of steps
 */
export async function getStepCount(tokenId: number): Promise<number> {
  if (!isValidTokenId(tokenId)) {
    throw new ValidationError(
      "Invalid token ID",
      "Please enter a valid token ID.",
      { field: "tokenId" }
    );
  }

  try {
    const contract = getContractReadOnly();
    const count = await contract.getStepCount(tokenId);
    return Number(count);
  } catch (error: unknown) {
    const err = error as { reason?: string; message?: string };
    if (
      err.reason?.includes("does not exist") ||
      err.message?.includes("does not exist")
    ) {
      throw new NotFoundError(
        `Token ${tokenId} does not exist`,
        `Batch NFT with ID ${tokenId} does not exist.`
      );
    }
    logError("getStepCount failed", error, { tokenId });
    throw parseBlockchainError(error);
  }
}

/**
 * Get specific step from batch
 * @param tokenId Token ID
 * @param stepIndex Step index
 * @returns Step data
 */
export async function getStep(
  tokenId: number,
  stepIndex: number
): Promise<{ stepHash: string; actor: string; timestamp: bigint }> {
  if (!isValidTokenId(tokenId)) {
    throw new ValidationError(
      "Invalid token ID",
      "Please enter a valid token ID.",
      { field: "tokenId" }
    );
  }

  if (stepIndex < 0) {
    throw new ValidationError(
      "Invalid step index",
      "Step index must be a non-negative number.",
      { field: "stepIndex" }
    );
  }

  try {
    const contract = getContractReadOnly();
    return await contract.getStep(tokenId, stepIndex);
  } catch (error: unknown) {
    const err = error as { reason?: string; message?: string };
    if (
      err.reason?.includes("does not exist") ||
      err.message?.includes("does not exist")
    ) {
      throw new NotFoundError(
        `Token ${tokenId} does not exist`,
        `Batch NFT with ID ${tokenId} does not exist.`
      );
    }
    if (
      err.reason?.includes("out of bounds") ||
      err.message?.includes("out of bounds")
    ) {
      throw new ValidationError(
        "Step index out of bounds",
        `Step index ${stepIndex} is out of bounds for this batch.`,
        { field: "stepIndex" }
      );
    }
    logError("getStep failed", error, { tokenId, stepIndex });
    throw parseBlockchainError(error);
  }
}

/**
 * Check if address has MINTER_ROLE
 * @param address Address to check
 * @returns True if address is a minter
 */
export async function canMint(address: string): Promise<boolean> {
  if (!isValidAddress(address)) {
    throw new ValidationError(
      "Invalid address",
      "Please provide a valid Ethereum address.",
      { field: "address" }
    );
  }

  try {
    const contract = getContractReadOnly();
    const MINTER_ROLE = await contract.MINTER_ROLE();
    return await contract.hasRole(MINTER_ROLE, address);
  } catch (error) {
    logError("Error checking minter role", error, { address });
    return false;
  }
}

/**
 * Listen for BatchMinted events
 * @param callback Function to call when event is emitted
 * @returns Unsubscribe function
 */
export function onBatchMinted(
  callback: (tokenId: number, to: string, metadataURI: string) => void
): () => void {
  const contract = getContractReadOnly();

  const listener = (tokenId: bigint, to: string, metadataURI: string) => {
    callback(Number(tokenId), to, metadataURI);
  };

  contract.on("BatchMinted", listener);

  return () => {
    contract.removeListener("BatchMinted", listener);
  };
}

/**
 * Listen for StepRecorded events
 * @param tokenId Token ID to listen for (optional, listen to all if not provided)
 * @param callback Function to call when event is emitted
 * @returns Unsubscribe function
 */
export function onStepRecorded(
  tokenId: number | null,
  callback: (
    tokenId: number,
    actor: string,
    stepHash: string,
    timestamp: number
  ) => void
): () => void {
  const contract = getContractReadOnly();

  const listener = (
    eventTokenId: bigint,
    actor: string,
    stepHash: string,
    timestamp: bigint
  ) => {
    if (tokenId === null || Number(eventTokenId) === tokenId) {
      callback(Number(eventTokenId), actor, stepHash, Number(timestamp));
    }
  };

  if (tokenId !== null) {
    contract.on(contract.filters.StepRecorded(tokenId), listener);
  } else {
    contract.on("StepRecorded", listener);
  }

  return () => {
    if (tokenId !== null) {
      contract.removeListener(contract.filters.StepRecorded(tokenId), listener);
    } else {
      contract.removeListener("StepRecorded", listener);
    }
  };
}

/**
 * Listen for Transfer events
 * @param tokenId Token ID to listen for (optional, listen to all if not provided)
 * @param callback Function to call when event is emitted
 * @returns Unsubscribe function
 */
export function onTransfer(
  tokenId: number | null,
  callback: (from: string, to: string, eventTokenId: number) => void
): () => void {
  const contract = getContractReadOnly();

  const listener = (from: string, to: string, eventTokenId: bigint) => {
    if (tokenId === null || Number(eventTokenId) === tokenId) {
      callback(from, to, Number(eventTokenId));
    }
  };

  if (tokenId !== null) {
    contract.on(contract.filters.Transfer(null, null, tokenId), listener);
  } else {
    contract.on("Transfer", listener);
  }

  return () => {
    if (tokenId !== null) {
      contract.removeListener(
        contract.filters.Transfer(null, null, tokenId),
        listener
      );
    } else {
      contract.removeListener("Transfer", listener);
    }
  };
}

/**
 * Calculate SHA-256 hash of data (for step hashing)
 * @param data Data to hash
 * @returns 0x-prefixed hash string
 */
export function hashStepData(data: unknown): string {
  const jsonString = JSON.stringify(data);
  return ethers.id(jsonString);
}

/**
 * Verify that a recalculated hash matches the on-chain hash
 * @param data Original data
 * @param onChainHash Hash from blockchain
 * @returns True if hashes match
 */
export function verifyStepHash(data: unknown, onChainHash: string): boolean {
  const calculatedHash = hashStepData(data);
  return calculatedHash.toLowerCase() === onChainHash.toLowerCase();
}
