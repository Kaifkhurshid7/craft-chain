"use client";

import { useWallet } from "@/context/WalletContext";
import Link from "next/link";

export default function Dashboard() {
  const { wallet, connect, isLoading, error, clearError } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary">Craft-Chain</h1>
              <p className="text-sm text-muted mt-1">
                Blockchain-Based Craft Batch Traceability
              </p>
            </div>
            <div className="flex items-center gap-4">
              {wallet.isConnected ? (
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                  </p>
                  <p
                    className={`text-xs ${
                      wallet.isCorrectNetwork
                        ? "text-success"
                        : "text-warning"
                    }`}
                  >
                    {wallet.isCorrectNetwork
                      ? "Sepolia Connected"
                      : "Wrong Network"}
                  </p>
                </div>
              ) : null}
              <button
                onClick={connect}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
              >
                {isLoading ? "Connecting..." : "Connect Wallet"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="container mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container py-12">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Welcome to Craft-Chain
            </h2>
            <p className="text-lg text-muted mb-4">
              Transparent and verifiable supply chain traceability for
              handcrafted products using blockchain technology.
            </p>
            <p className="text-muted mb-6">
              Each product batch is represented by a unique ERC-721 NFT on the
              Ethereum Sepolia testnet. Track custody changes, record
              processing steps, and verify complete batch history with
              cryptographic certainty.
            </p>

            {!wallet.isConnected ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                  Connect your MetaMask wallet to begin minting and tracking
                  batches.
                </p>
              </div>
            ) : wallet.isCorrectNetwork ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800">
                  Your wallet is connected to Sepolia testnet. Ready to proceed.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800">
                  Please switch to Sepolia testnet to use this application.
                </p>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Mint Feature */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2">Mint Batch</h3>
              <p className="text-sm text-muted mb-4">
                Create a new batch NFT with metadata stored on IPFS
              </p>
              {wallet.isConnected && wallet.isCorrectNetwork && (
                <Link
                  href="/mint"
                  className="inline-block px-4 py-2 bg-primary text-white rounded hover:bg-blue-600 transition text-sm"
                >
                  Go to Mint
                </Link>
              )}
            </div>

            {/* Record Step Feature */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-lg font-semibold mb-2">Record Step</h3>
              <p className="text-sm text-muted mb-4">
                Record processing and transportation steps in the supply chain
              </p>
              {wallet.isConnected && wallet.isCorrectNetwork && (
                <Link
                  href="/record-step"
                  className="inline-block px-4 py-2 bg-primary text-white rounded hover:bg-blue-600 transition text-sm"
                >
                  Record Step
                </Link>
              )}
            </div>

            {/* View Batch Feature */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="text-4xl mb-4">👁️</div>
              <h3 className="text-lg font-semibold mb-2">View Batch</h3>
              <p className="text-sm text-muted mb-4">
                View complete batch history and traceability information
              </p>
              <Link
                href="/batch/1"
                className="inline-block px-4 py-2 bg-secondary text-white rounded hover:bg-green-600 transition text-sm"
              >
                Browse Example
              </Link>
            </div>

            {/* Timeline Feature */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-lg font-semibold mb-2">Timeline</h3>
              <p className="text-sm text-muted mb-4">
                View complete timeline of all custody transfers and steps
              </p>
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed text-sm"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </section>

        {/* Information Section */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">For Artisans</h3>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="font-bold text-primary">1.</span>
                  <span>Connect your MetaMask wallet</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">2.</span>
                  <span>Navigate to "Mint Batch" page</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">3.</span>
                  <span>
                    Enter batch information (name, origin, material, etc.)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">4.</span>
                  <span>Upload batch image</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">5.</span>
                  <span>Approve transaction in MetaMask</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">6.</span>
                  <span>Receive unique Token ID and QR code</span>
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">For Buyers</h3>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="font-bold text-success">1.</span>
                  <span>Scan QR code on product packaging</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-success">2.</span>
                  <span>View batch details page</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-success">3.</span>
                  <span>See complete ownership history</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-success">4.</span>
                  <span>View all processing and transportation steps</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-success">5.</span>
                  <span>Verify product authenticity</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-success">6.</span>
                  <span>Make informed purchase decision</span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted">
          <p>
            Craft-Chain is an academic Web3 project demonstrating blockchain-based
            supply chain traceability on Ethereum Sepolia testnet.
          </p>
          <p className="mt-2">
            <a href="#" className="text-primary hover:underline">
              Documentation
            </a>
            {" | "}
            <a href="#" className="text-primary hover:underline">
              GitHub
            </a>
            {" | "}
            <a href="#" className="text-primary hover:underline">
              Contact
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
