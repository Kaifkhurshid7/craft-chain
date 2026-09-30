/**
 * Wallet context for managing MetaMask connection and wallet state
 * Provides wallet information to all components via React Context
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { WalletState, DEFAULT_WALLET_STATE } from "@/types";
import {
  getConnectedAddress,
  getChainId,
  isOnSepolia,
  switchToSepolia,
  getBalance,
} from "@/lib/blockchain";

interface WalletContextType {
  wallet: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

/**
 * Provider component for wallet state
 */
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>(DEFAULT_WALLET_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if MetaMask is installed
   */
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== "undefined" && window.ethereum !== undefined;
  }, []);

  /**
   * Update wallet state from blockchain data
   */
  const updateWalletState = useCallback(async () => {
    try {
      if (!isMetaMaskInstalled()) {
        setWallet(DEFAULT_WALLET_STATE);
        return;
      }

      const address = await getConnectedAddress();

      if (!address) {
        setWallet(DEFAULT_WALLET_STATE);
        return;
      }

      const chainId = await getChainId();
      const balance = await getBalance(address);
      const isCorrectNetwork = await isOnSepolia();

      setWallet({
        isConnected: true,
        address,
        chainId,
        balance,
        isCorrectNetwork,
      });

      setError(null);
    } catch (err) {
      console.error("Failed to update wallet state:", err);
      setWallet(DEFAULT_WALLET_STATE);
    }
  }, [isMetaMaskInstalled]);

  /**
   * Connect to MetaMask wallet
   */
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError("MetaMask is not installed. Please install MetaMask to continue.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request account access
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Update wallet state
      await updateWalletState();
    } catch (err: unknown) {
      const ethereumError = err as { code?: number; message?: string };

      if (ethereumError.code === 4001) {
        setError("Connection rejected. Please approve the connection in MetaMask.");
      } else if (ethereumError.code === -32002) {
        setError("Connection already pending. Please check MetaMask.");
      } else {
        setError(
          ethereumError.message ||
            "Failed to connect to MetaMask. Please try again."
        );
      }

      console.error("MetaMask connection error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isMetaMaskInstalled, updateWalletState]);

  /**
   * Disconnect from wallet
   */
  const disconnect = useCallback(() => {
    setWallet(DEFAULT_WALLET_STATE);
    setError(null);
  }, []);

  /**
   * Switch to Sepolia network
   */
  const switchNetwork = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError("MetaMask is not installed.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await switchToSepolia();
      await updateWalletState();
    } catch (err: unknown) {
      const switchError = err as { message?: string };
      setError(
        switchError.message ||
          "Failed to switch to Sepolia network. Please try again."
      );
      console.error("Network switch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isMetaMaskInstalled, updateWalletState]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Listen for wallet/network changes
   */
  useEffect(() => {
    if (!isMetaMaskInstalled()) {
      return;
    }

    // Update on mount
    updateWalletState();

    // Listen for account changes
    const handleAccountsChanged = () => {
      updateWalletState();
    };

    // Listen for chain changes
    const handleChainChanged = () => {
      updateWalletState();
    };

    // Listen for connection
    const handleConnect = () => {
      updateWalletState();
    };

    // Listen for disconnection
    const handleDisconnect = () => {
      setWallet(DEFAULT_WALLET_STATE);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    window.ethereum.on("connect", handleConnect);
    window.ethereum.on("disconnect", handleDisconnect);

    // Cleanup
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
      window.ethereum.removeListener("connect", handleConnect);
      window.ethereum.removeListener("disconnect", handleDisconnect);
    };
  }, [isMetaMaskInstalled, updateWalletState]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connect,
        disconnect,
        switchNetwork,
        isLoading,
        error,
        clearError,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

/**
 * Hook to use wallet context
 */
export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);

  if (context === undefined) {
    throw new Error("useWallet must be used within WalletProvider");
  }

  return context;
}
