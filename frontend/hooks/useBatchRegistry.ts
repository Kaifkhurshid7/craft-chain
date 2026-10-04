"use client";

import { useCallback, useEffect, useState } from "react";
import { Contract, JsonRpcProvider } from "ethers";
import { CRAFT_BATCH_ABI, getContractConfig } from "@/lib/contract";
import { getBatchMetadata } from "@/lib/ipfs";
import { BatchMetadata } from "@/types";

export interface RegistryBatch {
  tokenId: number;
  owner: string;
  stepCount: number;
  metadata?: BatchMetadata;
  name: string;
  origin: string;
  material: string;
  // A batch is verified once at least one step has been recorded on-chain
  isVerified: boolean;
}

const CHUNK_SIZE = 6;
const MAX_TOKENS = 120;

function attribute(metadata: BatchMetadata | undefined, trait: string): string {
  return metadata?.attributes?.find((a) => a.trait_type === trait)?.value || "";
}

async function loadBatch(
  contract: Contract,
  tokenId: number
): Promise<RegistryBatch | null> {
  let owner: string;
  try {
    owner = await contract.ownerOf(tokenId);
  } catch {
    // ownerOf reverts for tokens that were never minted (or were burned)
    return null;
  }

  const [stepCount, uri] = await Promise.all([
    contract
      .getStepCount(tokenId)
      .then(Number)
      .catch(() => 0),
    contract.tokenURI(tokenId).catch(() => ""),
  ]);

  let metadata: BatchMetadata | undefined;
  if (uri) {
    try {
      metadata = await getBatchMetadata(uri);
    } catch {
      metadata = undefined;
    }
  }

  return {
    tokenId,
    owner,
    stepCount,
    metadata,
    name: metadata?.name || `Batch #${tokenId}`,
    origin: attribute(metadata, "Origin"),
    material: attribute(metadata, "Material"),
    isVerified: stepCount > 0,
  };
}

/**
 * Reads registered batches straight from the contract. The contract is not
 * enumerable, so token IDs are probed sequentially (they start at 1) until a
 * chunk comes back empty.
 */
export function useBatchRegistry(): {
  batches: RegistryBatch[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
} {
  const [batches, setBatches] = useState<RegistryBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function run(): Promise<void> {
      setIsLoading(true);
      setError(null);
      setBatches([]);

      try {
        const config = getContractConfig();
        const contract = new Contract(
          config.address,
          CRAFT_BATCH_ABI,
          new JsonRpcProvider(config.rpcUrl)
        );

        const found: RegistryBatch[] = [];
        for (let start = 1; start <= MAX_TOKENS; start += CHUNK_SIZE) {
          const ids = Array.from({ length: CHUNK_SIZE }, (_, i) => start + i);
          const chunk = await Promise.all(
            ids.map((id) => loadBatch(contract, id))
          );
          const valid = chunk.filter((b): b is RegistryBatch => b !== null);
          if (cancelled) return;
          found.push(...valid);
          setBatches([...found].sort((a, b) => b.tokenId - a.tokenId));
          if (valid.length === 0) break;
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            (err as { message?: string }).message || "Failed to load batches"
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  return { batches, isLoading, error, reload };
}
