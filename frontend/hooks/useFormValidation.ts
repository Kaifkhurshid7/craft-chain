/**
 * Hook for form validation and error handling
 */

import { useState, useCallback } from "react";

interface FormErrors {
  [key: string]: string;
}

interface UseFormValidationReturn {
  errors: FormErrors;
  addError: (field: string, message: string) => void;
  removeError: (field: string) => void;
  clearErrors: () => void;
  hasErrors: boolean;
  getFieldError: (field: string) => string | undefined;
  setErrors: (errors: FormErrors) => void;
}

/**
 * Hook for managing form validation errors
 */
export function useFormValidation(): UseFormValidationReturn {
  const [errors, setErrorsState] = useState<FormErrors>({});

  const addError = useCallback((field: string, message: string) => {
    setErrorsState((prev) => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  const removeError = useCallback((field: string) => {
    setErrorsState((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  const setErrors = useCallback((newErrors: FormErrors) => {
    setErrorsState(newErrors);
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  const getFieldError = useCallback(
    (field: string): string | undefined => {
      return errors[field];
    },
    [errors]
  );

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    hasErrors,
    getFieldError,
    setErrors,
  };
}

/**
 * Validation utilities
 */

export function isValidEthereumAddress(address: string): boolean {
  if (!address || typeof address !== "string") return false;
  // Check format: 0x followed by 40 hex characters
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

export function isValidBatchName(name: string): boolean {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  // Must be between 3 and 100 characters, no leading/trailing spaces
  return trimmed.length >= 3 && trimmed.length <= 100;
}

export function isValidDescription(description: string): boolean {
  if (!description || typeof description !== "string") return false;
  const trimmed = description.trim();
  // Must be between 10 and 500 characters
  return trimmed.length >= 10 && trimmed.length <= 500;
}

export function isValidOrigin(origin: string): boolean {
  if (!origin || typeof origin !== "string") return false;
  const trimmed = origin.trim();
  // Must be between 3 and 100 characters
  return trimmed.length >= 3 && trimmed.length <= 100;
}

export function isValidMaterial(material: string): boolean {
  if (!material || typeof material !== "string") return false;
  const trimmed = material.trim();
  // Must be between 3 and 100 characters
  return trimmed.length >= 3 && trimmed.length <= 100;
}

export function isValidDate(dateString: string): boolean {
  if (!dateString || typeof dateString !== "string") return false;
  
  const parsedDate = new Date(dateString);
  if (isNaN(parsedDate.getTime())) return false;
  
  // Date must be in the past or today
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  return parsedDate <= today;
}

export function isValidFutureDate(dateString: string): boolean {
  if (!dateString || typeof dateString !== "string") return false;
  
  const parsedDate = new Date(dateString);
  if (isNaN(parsedDate.getTime())) return false;
  
  // Date must be in the future
  const now = new Date();
  return parsedDate > now;
}

export function isValidDateRange(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return false;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
  
  return start < end;
}

export function isValidDescription_Step(description: string): boolean {
  if (!description || typeof description !== "string") return false;
  const trimmed = description.trim();
  // Must be between 10 and 500 characters
  return trimmed.length >= 10 && trimmed.length <= 500;
}

export function isValidLocation(location: string): boolean {
  if (!location || typeof location !== "string") return false;
  const trimmed = location.trim();
  // Must be between 3 and 200 characters
  return trimmed.length >= 3 && trimmed.length <= 200;
}

export function isValidImageFile(file: File | null): boolean {
  if (!file || !(file instanceof File)) return false;
  
  // Check file type
  const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!validImageTypes.includes(file.type)) return false;
  
  // Check file size (max 5MB)
  const maxSizeInMB = 5;
  if (file.size > maxSizeInMB * 1024 * 1024) return false;
  
  return true;
}

export function isValidTokenId(tokenId: unknown): boolean {
  if (typeof tokenId !== "number") {
    // Try to parse if it's a string
    if (typeof tokenId === "string") {
      const parsed = parseInt(tokenId, 10);
      return !isNaN(parsed) && parsed > 0;
    }
    return false;
  }
  return Number.isInteger(tokenId) && tokenId > 0;
}

export function isValidURL(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidIPFSURI(uri: string): boolean {
  if (!uri || typeof uri !== "string") return false;
  
  // Check for ipfs:// format
  if (uri.startsWith("ipfs://")) {
    const hash = uri.replace("ipfs://", "");
    // CID must be at least 46 characters (Qm... format)
    return hash.length >= 46 && /^[a-zA-Z0-9]+$/.test(hash);
  }
  
  return false;
}

export function isValidStepHash(hash: string): boolean {
  if (!hash || typeof hash !== "string") return false;
  
  // Should be a 32-byte hex string with 0x prefix (66 characters total)
  // Or without 0x prefix (64 characters)
  const hexWithPrefix = /^0x[a-fA-F0-9]{64}$/.test(hash);
  const hexWithoutPrefix = /^[a-fA-F0-9]{64}$/.test(hash);
  
  return hexWithPrefix || hexWithoutPrefix;
}

export function isValidJSON(jsonString: string): boolean {
  if (!jsonString || typeof jsonString !== "string") return false;
  
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

export function isValidStepType(stepType: string): boolean {
  const validTypes = ["Processing", "Transportation", "Quality Check", "Packaging", "Other"];
  return validTypes.includes(stepType);
}


/**
 * Cross-field validation utilities
 */

export interface BatchFormData {
  batchName: string;
  description: string;
  origin: string;
  material: string;
  productionDate: string;
  image: File | null;
}

export interface StepFormData {
  tokenId: string | number;
  stepType: string;
  description: string;
  location: string;
  date: string;
}

export interface TransferFormData {
  tokenId: string | number;
  recipientAddress: string;
}

/**
 * Validate entire batch form
 */
export function validateBatchForm(data: BatchFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  // Validate batch name
  if (!isValidBatchName(data.batchName)) {
    errors.batchName = "Batch name must be between 3 and 100 characters.";
  }

  // Validate description
  if (!isValidDescription(data.description)) {
    errors.description = "Description must be between 10 and 500 characters.";
  }

  // Validate origin
  if (!isValidOrigin(data.origin)) {
    errors.origin = "Origin must be between 3 and 100 characters.";
  }

  // Validate material
  if (!isValidMaterial(data.material)) {
    errors.material = "Material must be between 3 and 100 characters.";
  }

  // Validate production date
  if (!isValidDate(data.productionDate)) {
    errors.productionDate = "Production date must be today or in the past.";
  }

  // Validate image
  if (!isValidImageFile(data.image)) {
    errors.image = "Image must be a valid image file (JPEG, PNG, GIF, WebP) and max 5MB.";
  }

  return errors;
}

/**
 * Validate entire step form
 */
export function validateStepForm(data: StepFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  // Validate token ID
  if (!isValidTokenId(data.tokenId)) {
    errors.tokenId = "Token ID must be a positive number.";
  }

  // Validate step type
  if (!isValidStepType(data.stepType)) {
    errors.stepType = "Please select a valid step type.";
  }

  // Validate description
  if (!isValidDescription_Step(data.description)) {
    errors.description = "Description must be between 10 and 500 characters.";
  }

  // Validate location
  if (!isValidLocation(data.location)) {
    errors.location = "Location must be between 3 and 200 characters.";
  }

  // Validate date
  if (!isValidDate(data.date)) {
    errors.date = "Date must be today or in the past.";
  }

  return errors;
}

/**
 * Validate entire transfer form
 */
export function validateTransferForm(data: TransferFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  // Validate token ID
  if (!isValidTokenId(data.tokenId)) {
    errors.tokenId = "Token ID must be a positive number.";
  }

  // Validate recipient address
  if (!isValidEthereumAddress(data.recipientAddress)) {
    errors.recipientAddress = "Please enter a valid Ethereum address.";
  }

  return errors;
}

/**
 * Sanitize string input (trim and remove extra spaces)
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input.trim().replace(/\s+/g, " ");
}

/**
 * Normalize Ethereum address to lowercase
 */
export function normalizeAddress(address: string): string {
  if (!address || typeof address !== "string") return "";
  return address.toLowerCase();
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get minimum password strength (if needed for future features)
 */
export function getPasswordStrength(password: string): "weak" | "medium" | "strong" {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;

  if (strength <= 2) return "weak";
  if (strength <= 4) return "medium";
  return "strong";
}
