/**
 * Hook for managing async operations with loading, error, and data states
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { logDebug, logWarn, logError } from "@/lib/errorLogger";

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncReturn<T> extends UseAsyncState<T> {
  execute: () => Promise<void>;
  reset: () => void;
  retry: () => Promise<void>;
}

interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  isRetryable?: (error: unknown) => boolean;
}

/**
 * Hook for managing async operations
 * @param asyncFunction Async function to execute
 * @param immediate Whether to execute immediately on mount
 * @returns State and control functions
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
): UseAsyncReturn<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await asyncFunction();
      setState({ data: response, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const retry = useCallback(async () => {
    logDebug("Retrying async operation");
    await execute();
  }, [execute]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute, reset, retry };
}

/**
 * Hook for delayed async operations (debounced)
 */
export function useAsyncDebounced<T>(
  asyncFunction: () => Promise<T>,
  delay: number = 500,
  immediate: boolean = false
): UseAsyncReturn<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await asyncFunction();
      setState({ data: response, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const retry = useCallback(async () => {
    logDebug("Retrying debounced async operation");
    await execute();
  }, [execute]);

  useEffect(() => {
    if (!immediate) {
      return;
    }

    const timer = setTimeout(() => {
      execute();
    }, delay);

    return () => clearTimeout(timer);
  }, [execute, immediate, delay]);

  return { ...state, execute, reset, retry };
}

/**
 * Hook for async operations with automatic retry logic and exponential backoff
 */
export function useAsyncWithRetry<T>(
  asyncFunction: () => Promise<T>,
  options: RetryOptions = {},
  immediate: boolean = true
): UseAsyncReturn<T> & { attemptCount: number; isRetrying: boolean } {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    backoffMultiplier = 2,
    isRetryable = defaultIsRetryable,
  } = options;

  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const [attemptCount, setAttemptCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Calculate delay with exponential backoff
   */
  const calculateDelay = useCallback(
    (attempt: number): number => {
      const delay = initialDelayMs * Math.pow(backoffMultiplier, attempt);
      return Math.min(delay, maxDelayMs);
    },
    [initialDelayMs, backoffMultiplier, maxDelayMs]
  );

  /**
   * Execute with retry logic
   */
  const executeWithRetry = useCallback(async () => {
    abortControllerRef.current = new AbortController();
    setState({ data: null, loading: true, error: null });
    setAttemptCount(0);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        logDebug("Executing async operation", {
          attempt: attempt + 1,
          maxAttempts: maxRetries + 1,
        });

        setAttemptCount(attempt + 1);

        const response = await asyncFunction();
        setState({ data: response, loading: false, error: null });
        setIsRetrying(false);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries && isRetryable(error)) {
          const delayMs = calculateDelay(attempt);
          logWarn(
            `Attempt ${attempt + 1} failed, retrying in ${delayMs}ms`,
            error
          );
          setIsRetrying(true);

          await new Promise((resolve) => {
            const timeoutId = setTimeout(resolve, delayMs);
            abortControllerRef.current!.signal.addEventListener("abort", () => {
              clearTimeout(timeoutId);
              resolve(null);
            });
          });
        } else {
          if (attempt === maxRetries) {
            logError(`Failed after ${maxRetries + 1} attempts`, lastError);
          }
          setState({
            data: null,
            loading: false,
            error: lastError,
          });
          setIsRetrying(false);
          return;
        }
      }
    }

    setState({
      data: null,
      loading: false,
      error: lastError,
    });
    setIsRetrying(false);
  }, [asyncFunction, maxRetries, calculateDelay, isRetryable]);

  /**
   * Manual retry function
   */
  const retry = useCallback(async () => {
    logDebug("Manual retry triggered");
    await executeWithRetry();
  }, [executeWithRetry]);

  /**
   * Reset function
   */
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({ data: null, loading: false, error: null });
    setAttemptCount(0);
    setIsRetrying(false);
  }, []);

  /**
   * Execute on mount if immediate
   */
  useEffect(() => {
    if (immediate) {
      executeWithRetry();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate, executeWithRetry]);

  return {
    ...state,
    execute: executeWithRetry,
    reset,
    retry,
    attemptCount,
    isRetrying,
  };
}

/**
 * Default retry predicate - determines which errors are retryable
 */
function defaultIsRetryable(error: unknown): boolean {
  const err = error as { code?: string; message?: string };

  // Don't retry validation errors or permission errors
  if (err.code === "VALIDATION_ERROR" || err.code === "PERMISSION_ERROR") {
    return false;
  }

  // Don't retry if error message contains non-retryable indicators
  const message = err.message || "";
  if (
    message.includes("unauthorized") ||
    message.includes("forbidden") ||
    message.includes("does not exist") ||
    message.includes("invalid") ||
    message.includes("rejected")
  ) {
    return false;
  }

  if (
    message.includes("ECONNREFUSED") ||
    message.includes("ECONNRESET") ||
    message.includes("ETIMEDOUT") ||
    message.includes("timeout") ||
    message.includes("network") ||
    message.includes("ERR_")
  ) {
    return true;
  }

  return true;
}

/**
 * Custom retry predicate creator for specific use cases
 */
export function createRetryPredicate(
  retryOnCodes?: string[],
  noRetryOnCodes?: string[]
): (error: unknown) => boolean {
  return (error: unknown) => {
    const err = error as { code?: string; message?: string };
    const code = err.code || "";
    const message = err.message || "";

    if (noRetryOnCodes?.includes(code)) {
      return false;
    }

    if (retryOnCodes?.includes(code)) {
      return true;
    }

    return defaultIsRetryable(error);
  };
}
