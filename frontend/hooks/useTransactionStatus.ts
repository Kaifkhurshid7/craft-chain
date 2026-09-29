/**
 * Hook for managing transaction status and feedback
 */

import { useState, useCallback } from "react";
import { TransactionStatus, TransactionResult } from "@/types";

interface UseTransactionStatusReturn {
  status: TransactionStatus;
  result: TransactionResult;
  setLoading: () => void;
  setSuccess: (hash?: string, blockNumber?: number, gasUsed?: string) => void;
  setError: (message: string) => void;
  reset: () => void;
}

/**
 * Hook for managing transaction status
 */
export function useTransactionStatus(): UseTransactionStatusReturn {
  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [result, setResult] = useState<TransactionResult>({
    status: "idle",
  });

  const handleSetLoading = useCallback(() => {
    setStatus("pending");
    setResult({ status: "pending" });
  }, []);

  const handleSetSuccess = useCallback(
    (hash?: string, blockNumber?: number, gasUsed?: string) => {
      setStatus("success");
      setResult({
        status: "success",
        hash,
        blockNumber,
        gasUsed,
      });
    },
    []
  );

  const handleSetError = useCallback((message: string) => {
    setStatus("error");
    setResult({
      status: "error",
      error: message,
    });
  }, []);

  const handleReset = useCallback(() => {
    setStatus("idle");
    setResult({ status: "idle" });
  }, []);

  return {
    status,
    result,
    setLoading: handleSetLoading,
    setSuccess: handleSetSuccess,
    setError: handleSetError,
    reset: handleReset,
  };
}
