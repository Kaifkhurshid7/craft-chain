/**
 * Comprehensive error handling utility
 * Categorizes errors and provides user-friendly messages
 */

/**
 * Error type enumerations
 */
export enum ErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  CONTRACT_ERROR = "CONTRACT_ERROR",
  IPFS_ERROR = "IPFS_ERROR",
  TRANSACTION_ERROR = "TRANSACTION_ERROR",
  WALLET_ERROR = "WALLET_ERROR",
  GAS_ERROR = "GAS_ERROR",
  PERMISSION_ERROR = "PERMISSION_ERROR",
  NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Base application error class
 */
export class AppError extends Error {
  readonly type: ErrorType;
  readonly userMessage: string;
  readonly code?: string;
  readonly details?: Record<string, unknown>;
  readonly recoverable: boolean;
  readonly suggestedAction?: string;

  constructor(
    type: ErrorType,
    message: string,
    userMessage: string,
    options: {
      code?: string;
      details?: Record<string, unknown>;
      recoverable?: boolean;
      suggestedAction?: string;
    } = {}
  ) {
    super(message);
    this.type = type;
    this.userMessage = userMessage;
    this.code = options.code;
    this.details = options.details;
    this.recoverable = options.recoverable ?? true;
    this.suggestedAction = options.suggestedAction;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    userMessage: string,
    options?: { field?: string }
  ) {
    super(ErrorType.VALIDATION_ERROR, message, userMessage, {
      recoverable: true,
      details: options?.field ? { field: options.field } : undefined,
    });
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Network error
 */
export class NetworkError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(
      ErrorType.NETWORK_ERROR,
      message,
      userMessage ||
        "Network error occurred. Please check your internet connection.",
      {
        recoverable: true,
        suggestedAction: "Check your internet connection and try again.",
      }
    );
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Contract error
 */
export class ContractError extends AppError {
  constructor(
    message: string,
    userMessage: string,
    options?: { code?: string; recoverable?: boolean; suggestedAction?: string }
  ) {
    super(ErrorType.CONTRACT_ERROR, message, userMessage, {
      code: options?.code,
      recoverable: options?.recoverable ?? true,
      suggestedAction: options?.suggestedAction,
    });
    Object.setPrototypeOf(this, ContractError.prototype);
  }
}

/**
 * IPFS error
 */
export class IPFSError extends AppError {
  constructor(
    message: string,
    userMessage?: string,
    options?: { code?: string }
  ) {
    super(
      ErrorType.IPFS_ERROR,
      message,
      userMessage ||
        "Failed to upload or retrieve data from IPFS. Please try again.",
      {
        code: options?.code,
        recoverable: true,
        suggestedAction: "Check your internet connection and try again.",
      }
    );
    Object.setPrototypeOf(this, IPFSError.prototype);
  }
}

/**
 * Transaction error
 */
export class TransactionError extends AppError {
  constructor(
    message: string,
    userMessage: string,
    options?: { code?: string; recoverable?: boolean; suggestedAction?: string }
  ) {
    super(ErrorType.TRANSACTION_ERROR, message, userMessage, {
      code: options?.code,
      recoverable: options?.recoverable ?? true,
      suggestedAction:
        options?.suggestedAction ||
        "Please verify your transaction details and try again.",
    });
    Object.setPrototypeOf(this, TransactionError.prototype);
  }
}

/**
 * Wallet error
 */
export class WalletError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(
      ErrorType.WALLET_ERROR,
      message,
      userMessage || "Wallet error occurred. Please check MetaMask.",
      {
        recoverable: true,
        suggestedAction: "Ensure MetaMask is connected and try again.",
      }
    );
    Object.setPrototypeOf(this, WalletError.prototype);
  }
}

/**
 * Gas estimation error
 */
export class GasError extends AppError {
  constructor(
    message: string,
    userMessage?: string,
    options?: { recoverable?: boolean }
  ) {
    super(
      ErrorType.GAS_ERROR,
      message,
      userMessage || "Insufficient gas or gas estimation failed.",
      {
        recoverable: options?.recoverable ?? true,
        suggestedAction:
          "Ensure you have enough ETH for gas fees and try again.",
      }
    );
    Object.setPrototypeOf(this, GasError.prototype);
  }
}

/**
 * Permission error
 */
export class PermissionError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(
      ErrorType.PERMISSION_ERROR,
      message,
      userMessage || "You do not have permission to perform this action.",
      {
        recoverable: false,
        suggestedAction: "Only authorized addresses can perform this action.",
      }
    );
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(
      ErrorType.NOT_FOUND_ERROR,
      message,
      userMessage || "The requested resource was not found.",
      {
        recoverable: false,
      }
    );
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(
      ErrorType.TIMEOUT_ERROR,
      message,
      userMessage || "The operation timed out. Please try again.",
      {
        recoverable: true,
        suggestedAction: "Check your internet connection and try again.",
      }
    );
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Error classification and mapping utilities
 */

/**
 * Parse blockchain error and convert to AppError
 */
export function parseBlockchainError(error: unknown): AppError {
  const err = error as {
    code?: unknown;
    reason?: string;
    message?: string;
    [key: string]: unknown;
  };

  if (err.code === "ACTION_REJECTED" || err.reason?.includes("rejected")) {
    return new TransactionError(
      "User rejected transaction",
      "You rejected the transaction. Please try again if you want to proceed.",
      { recoverable: true, code: "USER_REJECTED" }
    );
  }

  if (
    err.code === "INSUFFICIENT_FUNDS" ||
    err.reason?.includes("insufficient")
  ) {
    return new GasError(
      "Insufficient funds for gas",
      "You don't have enough ETH to pay for this transaction.",
      { recoverable: true }
    );
  }

  if (err.reason?.includes("does not exist")) {
    return new NotFoundError(
      "Token does not exist",
      "The batch NFT you're looking for does not exist."
    );
  }

  if (
    err.reason?.includes("unauthorized") ||
    err.reason?.includes("AccessControl")
  ) {
    return new PermissionError(
      "Not authorized to perform this action",
      "Only authorized addresses can perform this action."
    );
  }

  if (err.reason?.includes("invalid address")) {
    return new ValidationError(
      "Invalid address format",
      "Please enter a valid Ethereum address.",
      { field: "address" }
    );
  }

  if (err.reason?.includes("nonce")) {
    return new TransactionError(
      "Transaction nonce error",
      "There was an issue with your transaction sequence. Please try again.",
      {
        recoverable: true,
        suggestedAction: "Wait a moment and try again.",
      }
    );
  }

  if (err.reason?.includes("reverted")) {
    return new ContractError(
      "Transaction reverted",
      "The transaction failed on-chain. This could be due to invalid data or contract state.",
      {
        recoverable: true,
        suggestedAction: "Please verify your inputs and try again.",
      }
    );
  }

  const message = err.message ? String(err.message) : "Unknown error";
  return new AppError(
    ErrorType.UNKNOWN_ERROR,
    message,
    "An unexpected error occurred. Please try again.",
    { recoverable: true }
  );
}

/**
 * Parse IPFS error and convert to AppError
 */
export function parseIPFSError(error: unknown): AppError {
  const err = error as {
    code?: unknown;
    reason?: string;
    message?: string;
    [key: string]: unknown;
  };
  const message = err.message ? String(err.message) : "Unknown IPFS error";

  if (message.includes("timeout") || message.includes("timed out")) {
    return new TimeoutError(
      `IPFS operation timed out: ${message}`,
      "The upload or retrieval took too long. Please check your internet connection and try again."
    );
  }

  if (message.includes("network") || message.includes("ECONNREFUSED")) {
    return new NetworkError(
      `IPFS network error: ${message}`,
      "Could not connect to IPFS. Please check your internet connection."
    );
  }

  if (message.includes("unauthorized") || message.includes("401")) {
    return new PermissionError(
      `IPFS authentication error: ${message}`,
      "Authentication with IPFS service failed. Please check your API key."
    );
  }

  if (message.includes("413") || message.includes("too large")) {
    return new ValidationError(
      "File too large for IPFS",
      "The file you're trying to upload is too large. Maximum size is 5MB.",
      { field: "file" }
    );
  }

  return new IPFSError(
    message,
    "Failed to process IPFS operation. Please try again."
  );
}

/**
 * Parse network error and convert to AppError
 */
export function parseNetworkError(error: unknown): AppError {
  const err = error as {
    code?: unknown;
    reason?: string;
    message?: string;
    [key: string]: unknown;
  };
  const message = err.message ? String(err.message) : "Unknown network error";

  if (message.includes("ECONNREFUSED") || message.includes("unreachable")) {
    return new NetworkError(
      message,
      "Cannot connect to the blockchain network. Please check your internet connection."
    );
  }

  if (message.includes("Alchemy") || message.includes("RPC")) {
    return new NetworkError(
      message,
      "RPC provider is unavailable. Please try again in a moment."
    );
  }

  return new NetworkError(message);
}

/**
 * Check if an error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.recoverable;
  }
  return true; // Default to recoverable for unknown errors
}

/**
 * Get suggested action for an error
 */
export function getSuggestedAction(error: unknown): string | undefined {
  if (error instanceof AppError) {
    return error.suggestedAction;
  }
  return undefined;
}

/**
 * Get user-friendly message for an error
 */
export function getUserMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }
  if (error instanceof Error) {
    return error.message || "An unexpected error occurred";
  }
  return "An unexpected error occurred";
}

/**
 * Get error type
 */
export function getErrorType(error: unknown): ErrorType {
  if (error instanceof AppError) {
    return error.type;
  }
  return ErrorType.UNKNOWN_ERROR;
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(error: unknown): Record<string, unknown> {
  if (error instanceof AppError) {
    return {
      type: error.type,
      message: error.message,
      code: error.code,
      details: error.details,
      recoverable: error.recoverable,
      stack: error.stack,
    };
  }
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error.message,
      stack: error.stack,
    };
  }
  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: String(error),
  };
}
