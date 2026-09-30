/**
 * Contract context for managing smart contract interactions
 * Provides contract operations to components via React Context
 */

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { ContractContextType, BatchNFT, BatchHistory } from "@/types";
import {
  mintBatch,
  recordStep,
  transferBatch,
  getBatchOwner,
  getBatchMetadataURI,
  getBatchSteps,
  canMint as checkCanMint,
} from "@/lib/blockchain";
import { getBatchMetadata, getStepData, verifyDataHash } from "@/lib/ipfs";
import { useWallet } from "./WalletContext";

const ContractContext = createContext<ContractContextType | undefined>(undefined);

/**
 * Provider component for contract interactions
 */
export function ContractProvider({ children }: { children: React.ReactNode }) {
  const { wallet } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Mint a new batch NFT
   */
  const performMintBatch = useCallback(
    async (to: string, metadataURI: string): Promise<string | null> => {
      if (!wallet.isConnected) {
        setError("Wallet is not connected");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        return await mintBatch(to, metadataURI);
      } catch (err: unknown) {
        const contractError = err as { message?: string };
        const errorMessage =
          contractError.message || "Failed to mint batch";
        setError(errorMessage);
        console.error("Mint batch error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet.isConnected]
  );

  /**
   * Record a supply chain step
   */
  const performRecordStep = useCallback(
    async (tokenId: number, stepHash: string): Promise<string | null> => {
      if (!wallet.isConnected) {
        setError("Wallet is not connected");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const txHash = await recordStep(tokenId, stepHash);
        return txHash;
      } catch (err: unknown) {
        const contractError = err as { message?: string };
        const errorMessage =
          contractError.message || "Failed to record step";
        setError(errorMessage);
        console.error("Record step error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet.isConnected]
  );

  /**
   * Transfer batch to another address
   */
  const performTransferBatch = useCallback(
    async (to: string, tokenId: number): Promise<string | null> => {
      if (!wallet.isConnected) {
        setError("Wallet is not connected");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const txHash = await transferBatch(to, tokenId);
        return txHash;
      } catch (err: unknown) {
        const contractError = err as { message?: string };
        const errorMessage =
          contractError.message || "Failed to transfer batch";
        setError(errorMessage);
        console.error("Transfer batch error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet.isConnected]
  );

  /**
   * Get complete batch information
   */
  const getBatchNFTData = useCallback(
    async (tokenId: number): Promise<BatchNFT | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const metadataURI = await getBatchMetadataURI(tokenId);
        const owner = await getBatchOwner(tokenId);

        let metadata = undefined;
        try {
          metadata = await getBatchMetadata(metadataURI);
        } catch (err) {
          console.warn("Failed to fetch metadata from IPFS:", err);
        }

        return {
          tokenId,
          owner,
          metadataURI,
          metadata,
        };
      } catch (err: unknown) {
        const contractError = err as { message?: string };
        const errorMessage =
          contractError.message || "Failed to fetch batch information";
        setError(errorMessage);
        console.error("Get batch error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Get complete batch history and traceability
   */
  const getBatchHistoryData = useCallback(
    async (tokenId: number): Promise<BatchHistory | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Get batch NFT data
        const batch = await getBatchNFTData(tokenId);
        if (!batch) {
          return null;
        }

        // Get all steps for the batch
        const onChainSteps = await getBatchSteps(tokenId);
        const completeSteps = [];

        for (const step of onChainSteps) {
          // Note: In real implementation, we'd need to store step CID on-chain or off-chain
          // For now, we'll just include the on-chain data
          completeSteps.push({
            stepHash: step.stepHash,
            actor: step.actor,
            timestamp: Number(step.timestamp),
          });
        }

        // Build timeline (simplified - real implementation would query Transfer events)
        const timeline = completeSteps.map((step) => ({
          type: "step" as const,
          timestamp: step.timestamp,
          step,
        }));

        return {
          batch,
          currentOwner: batch.owner,
          transfers: [],
          steps: completeSteps,
          timeline,
        };
      } catch (err: unknown) {
        const contractError = err as { message?: string };
        const errorMessage =
          contractError.message || "Failed to fetch batch history";
        setError(errorMessage);
        console.error("Get batch history error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [getBatchNFTData]
  );

  /**
   * Check if address can mint
   */
  const canMint = useCallback(
    async (address: string): Promise<boolean> => {
      try {
        return await checkCanMint(address);
      } catch (err) {
        console.error("Error checking mint permission:", err);
        return false;
      }
    },
    []
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ContractContext.Provider
      value={{
        isLoading,
        error,
        mintBatch: performMintBatch,
        recordStep: performRecordStep,
        transferBatch: performTransferBatch,
        getBatchNFT: getBatchNFTData,
        getBatchHistory: getBatchHistoryData,
        canMint,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
}

/**
 * Hook to use contract context
 */
export function useContract(): ContractContextType {
  const context = useContext(ContractContext);

  if (context === undefined) {
    throw new Error("useContract must be used within ContractProvider");
  }

  return context;
}
