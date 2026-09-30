"use client";

import { useWallet } from "@/context/WalletContext";

export function WalletConnect() {
  const { wallet, connect, disconnect, switchNetwork, isLoading, error, clearError } =
    useWallet();

  if (wallet.isConnected && wallet.isCorrectNetwork) {
    return null; // Hide if already connected to correct network
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          {!wallet.isConnected ? (
            <>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-sm text-blue-800 mb-4">
                Connect MetaMask to mint batches, record steps, and transfer
                ownership.
              </p>
              <button
                onClick={connect}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition font-medium"
              >
                {isLoading ? "Connecting..." : "Connect MetaMask"}
              </button>
            </>
          ) : !wallet.isCorrectNetwork ? (
            <>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Switch to Sepolia Testnet
              </h3>
              <p className="text-sm text-blue-800 mb-4">
                This application requires Ethereum Sepolia testnet. Please
                switch your network.
              </p>
              <button
                onClick={switchNetwork}
                disabled={isLoading}
                className="px-4 py-2 bg-warning text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition font-medium"
              >
                {isLoading ? "Switching..." : "Switch to Sepolia"}
              </button>
            </>
          ) : null}
        </div>

        <button
          onClick={disconnect}
          className="text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          <div className="flex justify-between items-start">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
