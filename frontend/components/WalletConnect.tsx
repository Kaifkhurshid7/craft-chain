"use client";

import { X } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

export function WalletConnect() {
  const { wallet, connect, disconnect, switchNetwork, isLoading, error, clearError } =
    useWallet();

  if (wallet.isConnected && wallet.isCorrectNetwork) {
    return null;
  }

  return (
    <div className="mb-6 border border-forest/15 bg-sand/60 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          {!wallet.isConnected ? (
            <>
              <p className="eyebrow mb-2">Wallet required</p>
              <h3 className="mb-2 font-serif text-xl font-semibold">Connect your wallet</h3>
              <p className="mb-4 text-sm text-ink/65">
                Connect MetaMask to mint batches, record steps, and transfer ownership.
              </p>
              <button onClick={connect} disabled={isLoading} className="btn-primary">
                {isLoading ? "Connecting..." : "Connect MetaMask"}
              </button>
            </>
          ) : (
            <>
              <p className="eyebrow mb-2">Wrong network</p>
              <h3 className="mb-2 font-serif text-xl font-semibold">Switch to Sepolia</h3>
              <p className="mb-4 text-sm text-ink/65">
                This application requires the Ethereum Sepolia testnet.
              </p>
              <button onClick={switchNetwork} disabled={isLoading} className="btn-primary">
                {isLoading ? "Switching..." : "Switch to Sepolia"}
              </button>
            </>
          )}
        </div>

        {wallet.isConnected && (
          <button
            onClick={disconnect}
            className="text-ink/40 transition hover:text-ink"
            aria-label="Disconnect"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-start justify-between border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
          <span>{error}</span>
          <button onClick={clearError} className="ml-2" aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
