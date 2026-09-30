/**
 * IPFS integration utilities for Craft-Chain
 * Handles upload, retrieval, and verification of batch metadata and step data
 * with timeout detection, error handling, and gateway fallbacks
 */

import { BatchMetadata, StepData, IPFSUploadResponse, ApiError } from "@/types";
import { hashStepData } from "./blockchain";
import { parseIPFSError, TimeoutError, IPFSError } from "./errors";
import { logDebug, logWarn, logError } from "./errorLogger";

// IPFS Gateway fallbacks
const IPFS_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://ipfs.io/ipfs/",
];

const UPLOAD_TIMEOUT_MS = 60000; // 60 seconds for uploads
const RETRIEVAL_TIMEOUT_MS = 30000; // 30 seconds for retrievals

/**
 * Get IPFS configuration from environment
 */
function getIPFSConfig() {
  const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
  const ipfsGateway =
    process.env.NEXT_PUBLIC_IPFS_GATEWAY || IPFS_GATEWAYS[0];

  if (!pinataJWT) {
    logWarn("NEXT_PUBLIC_PINATA_JWT not configured - IPFS uploads will fail");
  }

  return {
    pinataJWT,
    ipfsGateway,
    pinataUrl: "https://api.pinata.cloud",
  };
}

/**
 * Create an AbortController with timeout
 */
function createTimeoutAbortController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  // Store timeout ID for potential cleanup
  (controller as any)._timeoutId = timeoutId;
  
  return controller;
}

/**
 * Cleanup timeout from AbortController
 */
function cleanupTimeoutAbortController(controller: AbortController): void {
  const timeoutId = (controller as any)._timeoutId;
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
}

/**
 * Upload a file to IPFS via Pinata with timeout and error handling
 * @param file File to upload
 * @returns IPFS CID and URL
 */
export async function uploadFile(file: File): Promise<IPFSUploadResponse> {
  const { pinataJWT, ipfsGateway } = getIPFSConfig();

  if (!pinataJWT) {
    throw new IPFSError(
      "Pinata JWT not configured",
      "IPFS upload is not configured. Please set NEXT_PUBLIC_PINATA_JWT environment variable."
    );
  }

  // Validate file
  if (!file || file.size === 0) {
    throw new IPFSError(
      "File is empty",
      "Please select a file to upload."
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new IPFSError(
      "File size exceeds 10MB limit",
      "File must be smaller than 10MB."
    );
  }

  const controller = createTimeoutAbortController(UPLOAD_TIMEOUT_MS);

  try {
    const formData = new FormData();
    formData.append("file", file);

    // Add metadata
    const metadata = JSON.stringify({
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    });
    formData.append("pinataMetadata", metadata);

    // Set pinning options
    const options = JSON.stringify({
      cidVersion: 1,
    });
    formData.append("pinataOptions", options);

    logDebug("Starting IPFS file upload", { fileName: file.name, fileSize: file.size });

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pinataJWT}`,
      },
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorMessage = "Failed to upload file to IPFS";
      
      if (response.status === 401 || response.status === 403) {
        errorMessage = "IPFS authentication failed. Please check your API key.";
      } else if (response.status === 413) {
        errorMessage = "File is too large for IPFS.";
      } else if (response.status === 429) {
        errorMessage = "Rate limited by IPFS service. Please try again later.";
      }

      try {
        const error = await response.json();
        if (error.error?.details) {
          errorMessage = error.error.details;
        }
      } catch {
        // Ignore JSON parse error
      }

      throw new IPFSError(
        `IPFS upload failed with status ${response.status}`,
        errorMessage
      );
    }

    const data = (await response.json()) as {
      IpfsHash: string;
      PinSize: number;
      Timestamp: string;
    };

    logDebug("IPFS file upload successful", { cid: data.IpfsHash });

    return {
      cid: data.IpfsHash,
      url: `${ipfsGateway}${data.IpfsHash}`,
      size: data.PinSize,
    };
  } catch (error) {
    if (error instanceof IPFSError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      logWarn("IPFS upload timeout", { fileName: file.name });
      throw new TimeoutError(
        "IPFS upload timed out",
        "The upload took too long. Please check your internet connection and try again."
      );
    }

    logError("IPFS upload failed", error, { fileName: file.name });
    throw parseIPFSError(error);
  } finally {
    cleanupTimeoutAbortController(controller);
  }
}

/**
 * Upload JSON data to IPFS
 * @param data Data to upload as JSON
 * @param filename Optional filename for metadata
 * @returns IPFS CID and URL
 */
export async function uploadJSON(
  data: unknown,
  filename: string = "data.json"
): Promise<IPFSUploadResponse> {
  if (!data) {
    throw new IPFSError(
      "Data is required",
      "Please provide data to upload."
    );
  }

  try {
    // Convert data to JSON string
    const jsonString = JSON.stringify(data, null, 2);

    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: "application/json" });

    // Create a File from the Blob
    const file = new File([blob], filename, { type: "application/json" });

    return await uploadFile(file);
  } catch (error) {
    if (error instanceof IPFSError || error instanceof TimeoutError) {
      throw error;
    }
    logError("JSON upload failed", error);
    throw parseIPFSError(error);
  }
}

/**
 * Upload batch metadata to IPFS
 * @param metadata Batch metadata object
 * @returns IPFS CID and URL
 */
export async function uploadBatchMetadata(
  metadata: BatchMetadata
): Promise<IPFSUploadResponse> {
  // Validate metadata
  if (!metadata.name || metadata.name.trim().length === 0) {
    throw new IPFSError(
      "Batch name is required",
      "Please provide a batch name."
    );
  }

  if (!metadata.image || metadata.image.trim().length === 0) {
    throw new IPFSError(
      "Batch image is required",
      "Please upload a product image."
    );
  }

  return uploadJSON(metadata, "batch-metadata.json");
}

/**
 * Upload step data to IPFS
 * @param stepData Step information
 * @returns IPFS CID and URL
 */
export async function uploadStepData(
  stepData: StepData
): Promise<IPFSUploadResponse> {
  // Validate step data
  if (!stepData.stepType || stepData.stepType.trim().length === 0) {
    throw new IPFSError(
      "Step type is required",
      "Please select a step type."
    );
  }

  if (!stepData.description || stepData.description.trim().length === 0) {
    throw new IPFSError(
      "Step description is required",
      "Please enter a step description."
    );
  }

  if (!stepData.location || stepData.location.trim().length === 0) {
    throw new IPFSError(
      "Step location is required",
      "Please enter the step location."
    );
  }

  if (!stepData.date || stepData.date.trim().length === 0) {
    throw new IPFSError(
      "Step date is required",
      "Please enter the step date."
    );
  }

  return uploadJSON(stepData, "step-data.json");
}

/**
 * Retrieve JSON data from IPFS with gateway fallback
 * @param cid IPFS content identifier
 * @returns Parsed JSON data
 */
export async function getIPFSJSON<T>(cid: string): Promise<T> {
  if (!cid || cid.trim().length === 0) {
    throw new IPFSError(
      "CID is required",
      "Please provide a valid CID."
    );
  }

  // Support both raw CID and full IPFS URI
  let cidToUse = cid;
  if (cid.startsWith("ipfs://")) {
    cidToUse = cid.replace("ipfs://", "");
  }

  logDebug("Retrieving data from IPFS", { cid: cidToUse });

  // Try each gateway in sequence
  const errors: Error[] = [];

  for (const gateway of IPFS_GATEWAYS) {
    try {
      const controller = createTimeoutAbortController(RETRIEVAL_TIMEOUT_MS);

      try {
        const url = `${gateway}${cidToUse}`;
        const response = await fetch(url, {
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        if (response.ok) {
          const data = (await response.json()) as T;
          logDebug("Successfully retrieved data from IPFS", { cid: cidToUse, gateway });
          return data;
        }

        if (response.status === 404) {
          throw new IPFSError(
            "Data not found on IPFS",
            "The requested data could not be found on IPFS."
          );
        }

        throw new IPFSError(
          `IPFS retrieval failed with status ${response.status}`,
          `Failed to retrieve data from IPFS: ${response.statusText}`
        );
      } finally {
        cleanupTimeoutAbortController(controller);
      }
    } catch (error) {
      errors.push(error instanceof Error ? error : new Error(String(error)));

      // Log and continue to next gateway
      if (gateway !== IPFS_GATEWAYS[IPFS_GATEWAYS.length - 1]) {
        logWarn(`Gateway ${gateway} failed, trying next gateway`, error);
        continue;
      }
    }
  }

  // All gateways failed
  logError("All IPFS gateways failed", errors[0], { cid: cidToUse });
  throw parseIPFSError(errors[0] || new Error("All IPFS gateways failed"));
}

/**
 * Retrieve batch metadata from IPFS
 * @param metadataURI IPFS URI or CID
 * @returns Batch metadata
 */
export async function getBatchMetadata(
  metadataURI: string
): Promise<BatchMetadata> {
  return getIPFSJSON<BatchMetadata>(metadataURI);
}

/**
 * Retrieve step data from IPFS
 * @param stepCID IPFS CID of step data
 * @returns Step data
 */
export async function getStepData(stepCID: string): Promise<StepData> {
  return getIPFSJSON<StepData>(stepCID);
}

/**
 * Upload an image file and return the IPFS URI
 * @param imageFile Image file to upload
 * @returns IPFS URI in format ipfs://Qm...
 */
export async function uploadImage(file: File): Promise<string> {
  // Validate image file
  if (!file.type.startsWith("image/")) {
    throw new IPFSError(
      "Invalid file type",
      "File must be an image (JPEG, PNG, GIF, or WebP)."
    );
  }

  const maxSizeInMB = 5;
  if (file.size > maxSizeInMB * 1024 * 1024) {
    throw new IPFSError(
      "Image file is too large",
      `Image must be smaller than ${maxSizeInMB}MB.`
    );
  }

  const response = await uploadFile(file);
  return `ipfs://${response.cid}`;
}

/**
 * Get image URL from IPFS URI with fallback gateways
 * @param ipfsURI IPFS URI in format ipfs://Qm... or CID
 * @returns HTTP URL for image
 */
export function getImageUrl(ipfsURI: string): string {
  if (!ipfsURI) {
    return "";
  }

  let cidToUse = ipfsURI;
  if (ipfsURI.startsWith("ipfs://")) {
    cidToUse = ipfsURI.replace("ipfs://", "");
  }

  // Use primary gateway by default
  const { ipfsGateway } = getIPFSConfig();
  return `${ipfsGateway}${cidToUse}`;
}

/**
 * Get fallback image URLs from IPFS URI
 * @param ipfsURI IPFS URI in format ipfs://Qm... or CID
 * @returns Array of HTTP URLs from different gateways
 */
export function getImageUrls(ipfsURI: string): string[] {
  if (!ipfsURI) {
    return [];
  }

  let cidToUse = ipfsURI;
  if (ipfsURI.startsWith("ipfs://")) {
    cidToUse = ipfsURI.replace("ipfs://", "");
  }

  return IPFS_GATEWAYS.map((gateway) => `${gateway}${cidToUse}`);
}

/**
 * Create batch metadata with image upload
 * @param name Batch name
 * @param description Batch description
 * @param origin Batch origin
 * @param material Material used
 * @param productionDate Production date (ISO 8601)
 * @param imageFile Image file to upload
 * @returns Complete batch metadata ready for upload
 */
export async function createBatchMetadata(
  name: string,
  description: string,
  origin: string,
  material: string,
  productionDate: string,
  imageFile: File
): Promise<BatchMetadata> {
  try {
    // Upload image first
    const imageURI = await uploadImage(imageFile);

    return {
      name,
      description,
      image: imageURI,
      attributes: [
        { trait_type: "Origin", value: origin },
        { trait_type: "Material", value: material },
        { trait_type: "Production Date", value: productionDate },
      ],
    };
  } catch (error) {
    if (error instanceof IPFSError || error instanceof TimeoutError) {
      throw error;
    }
    logError("Failed to create batch metadata", error);
    throw parseIPFSError(error);
  }
}

/**
 * Verify that retrieved data matches the stored hash
 * @param data Data to verify
 * @param onChainHash Hash stored on blockchain
 * @returns True if hashes match
 */
export function verifyDataHash(data: unknown, onChainHash: string): boolean {
  const calculatedHash = hashStepData(data);
  return calculatedHash.toLowerCase() === onChainHash.toLowerCase();
}

/**
 * Pin a CID to ensure data persistence with error handling
 * @param cid IPFS content identifier to pin
 */
export async function pinCIDToPersistence(cid: string): Promise<void> {
  const { pinataJWT } = getIPFSConfig();

  if (!pinataJWT) {
    logWarn("Pinata JWT not configured - cannot pin CID");
    return;
  }

  if (!cid || cid.trim().length === 0) {
    throw new IPFSError(
      "CID is required",
      "Please provide a valid CID to pin."
    );
  }

  const controller = createTimeoutAbortController(30000); // 30 second timeout

  try {
    logDebug("Pinning CID to persistence", { cid });

    const response = await fetch("https://api.pinata.cloud/pinning/pinByHash", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${pinataJWT}`,
      },
      body: JSON.stringify({
        hashToPin: cid,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorMessage = "Failed to pin CID to IPFS";

      if (response.status === 401 || response.status === 403) {
        errorMessage = "IPFS authentication failed.";
      } else if (response.status === 429) {
        errorMessage = "Rate limited by IPFS service.";
      }

      try {
        const error = await response.json();
        if (error.error?.details) {
          errorMessage = error.error.details;
        }
      } catch {
        // Ignore JSON parse error
      }

      throw new IPFSError(
        `Failed to pin with status ${response.status}: ${errorMessage}`,
        errorMessage
      );
    }

    logDebug("Successfully pinned CID", { cid });
  } catch (error) {
    if (error instanceof IPFSError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      logWarn("Pin operation timeout", { cid });
      throw new TimeoutError(
        "Pinning operation timed out",
        "The pinning took too long. Please try again."
      );
    }

    logError("Pinning failed", error, { cid });
    throw parseIPFSError(error);
  } finally {
    cleanupTimeoutAbortController(controller);
  }
}

/**
 * Check IPFS gateway status with timeout
 * @returns True if any gateway is accessible
 */
export async function checkIPFSGateway(): Promise<boolean> {
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const controller = createTimeoutAbortController(5000);

      try {
        const response = await fetch(`${gateway}`, {
          method: "HEAD",
          signal: controller.signal,
        });
        cleanupTimeoutAbortController(controller);
        
        // 404 is expected for empty gateway, so that's OK
        return response.ok || response.status === 404;
      } finally {
        cleanupTimeoutAbortController(controller);
      }
    } catch (error) {
      logDebug(`IPFS gateway ${gateway} check failed`, { error });
      continue;
    }
  }

  logWarn("All IPFS gateways are unreachable");
  return false;
}

/**
 * Check Pinata service availability with timeout
 * @returns True if Pinata API is accessible
 */
export async function checkPinataService(): Promise<boolean> {
  const { pinataJWT } = getIPFSConfig();

  if (!pinataJWT) {
    return false;
  }

  const controller = createTimeoutAbortController(10000);

  try {
    const response = await fetch("https://api.pinata.cloud/data/testAuthentication", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${pinataJWT}`,
      },
      signal: controller.signal,
    });

    return response.ok;
  } catch (error) {
    logWarn("Pinata service check failed", error);
    return false;
  } finally {
    cleanupTimeoutAbortController(controller);
  }
}

/**
 * Format IPFS error for display
 */
export function formatIPFSError(error: unknown): string {
  if (error instanceof IPFSError) {
    return error.userMessage;
  }

  if (error instanceof TimeoutError) {
    return error.userMessage;
  }

  if (error instanceof Error) {
    if (error.message.includes("Failed to fetch")) {
      return "Network error - unable to connect to IPFS. Please check your connection.";
    }
    if (error.message.includes("401") || error.message.includes("Unauthorized")) {
      return "Authentication failed - check your IPFS API key configuration.";
    }
    if (error.message.includes("413")) {
      return "File is too large - maximum size is 10MB.";
    }
    return error.message;
  }

  return "An unknown IPFS error occurred";
}

/**
 * Export types for external use
 */
export type { BatchMetadata, StepData, IPFSUploadResponse, ApiError };
