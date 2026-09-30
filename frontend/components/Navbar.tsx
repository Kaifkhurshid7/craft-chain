"use client";

import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { formatAddress } from "@/lib/contract";

export function Navbar() {
  const { wallet, connect, disconnect, isLoading } = useWallet();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">⛓️</span>
            <div>
              <h1 className="text-lg font-bold text-dark">Craft-Chain</h1>
              <p className="text-xs text-muted">Batch Traceability</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/mint"
              className="text-muted hover:text-primary transition"
            >
              Mint Batch
            </Link>
            <Link
              href="/record-step"
              className="text-muted hover:text-primary transition"
            >
              Record Step
            </Link>
            <a
              href="#"
              className="text-muted hover:text-primary transition"
            >
              Docs
            </a>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center gap-3">
            {wallet.isConnected ? (
              <div className="flex items-center gap-2">
                {!wallet.isCorrectNetwork && (
                  <span className="text-xs bg-warning text-white px-2 py-1 rounded">
                    Wrong Network
                  </span>
                )}
                <div className="text-right text-sm">
                  <p className="font-semibold">{formatAddress(wallet.address || "")}</p>
                  <p className={`text-xs ${wallet.isCorrectNetwork ? "text-success" : "text-warning"}`}>
                    {wallet.isCorrectNetwork ? "Sepolia" : "Wrong Network"}
                  </p>
                </div>
                <button
                  onClick={disconnect}
                  className="px-3 py-1 text-sm bg-gray-200 text-dark rounded hover:bg-gray-300 transition"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition text-sm font-medium"
              >
                {isLoading ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
