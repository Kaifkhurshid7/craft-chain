"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({
  isOpen,
  onClose,
}: WalletModalProps): JSX.Element | null {
  const { wallet, connect, disconnect, switchNetwork, isLoading, error } =
    useWallet();

  if (!isOpen) return null;

  // Portal to <body>: the navbar's backdrop blur would otherwise trap the fixed overlay inside it
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md border border-forest/10 bg-paper p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold">
            Wallet Connection
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ink/40 hover:text-ink"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {!wallet.isConnected ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-ink/70">
              Connect your Ethereum wallet to verify product provenance and
              record journey steps on the Sepolia network.
            </p>
            <button
              onClick={async () => {
                await connect();
                onClose();
              }}
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? "Connecting..." : "Connect MetaMask"}
            </button>
            {error && <p className="text-xs text-danger">{error}</p>}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-sand p-4">
              <div className="mb-1 text-[10px] uppercase tracking-widest text-ink/50">
                Connected Address
              </div>
              <div className="break-all font-mono text-xs">
                {wallet.address}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-widest text-ink/50">
                  Network
                </div>
                <div
                  className={`text-sm font-medium ${
                    wallet.isCorrectNetwork ? "text-forest" : "text-danger"
                  }`}
                >
                  {wallet.isCorrectNetwork ? "Sepolia" : "Wrong Network"}
                </div>
              </div>
              <button
                onClick={() => {
                  disconnect();
                  onClose();
                }}
                className="text-sm font-medium text-danger hover:opacity-80"
              >
                Disconnect
              </button>
            </div>

            {!wallet.isCorrectNetwork && (
              <div className="space-y-3 border border-danger/20 bg-danger/5 p-3 text-xs text-danger">
                <p>Please switch your network to Sepolia Testnet.</p>
                <button
                  onClick={switchNetwork}
                  disabled={isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading ? "Switching..." : "Switch to Sepolia"}
                </button>
              </div>
            )}

            <button onClick={onClose} className="btn-outline w-full">
              Close
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
