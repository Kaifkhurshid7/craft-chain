"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Timeline } from "@/components/Timeline";
import { QRCodeComponent, QRCodeDownloadButton } from "@/components/QRCode";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Alert } from "@/components/Alert";
import { useWallet } from "@/context/WalletContext";
import { useContract } from "@/context/ContractContext";
import { BatchHistory, DEFAULT_BATCH_METADATA } from "@/types";
import { formatAddress, getEtherscanAddressUrl } from "@/lib/contract";
import { getImageUrl } from "@/lib/ipfs";

interface BatchDetailsPageProps {
  params: {
    tokenId: string;
  };
}

export default function BatchDetailsPage({ params }: BatchDetailsPageProps) {
  const { wallet } = useWallet();
  const { getBatchHistory, isLoading } = useContract();
  const [batchHistory, setBatchHistory] = useState<BatchHistory | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tokenId = parseInt(params.tokenId, 10);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://craft-chain.vercel.app";
  const batchUrl = `${baseUrl}/batch/${tokenId}`;

  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        const data = await getBatchHistory(tokenId);
        if (data) {
          setBatchHistory(data);
        } else {
          setError("Batch not found");
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error.message || "Failed to load batch");
      }
    };

    if (!isNaN(tokenId) && tokenId > 0) {
      fetchBatchData();
    } else {
      setError("Invalid token ID");
    }
  }, [tokenId, getBatchHistory]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container flex justify-center py-20">
            <LoadingSpinner size="lg" message="Loading batch details..." />
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container max-w-4xl">
            <Alert type="error" title="Error" message={error} dismissible={false} />
          </div>
        </main>
      </>
    );
  }

  if (!batchHistory) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container max-w-4xl">
            <Alert type="info" title="Not Found" message="Batch not found" dismissible={false} />
          </div>
        </main>
      </>
    );
  }

  const metadata = batchHistory.batch.metadata || DEFAULT_BATCH_METADATA;
  const imageUrl = getImageUrl(metadata.image);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Batch #{tokenId}</h1>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Image and QR Code */}
            <div className="lg:col-span-1">
              {/* Image */}
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                {imageUrl && (
                  <div className="relative w-full aspect-square mb-4">
                    <Image
                      src={imageUrl}
                      alt={metadata.name}
                      fill
                      className="object-cover rounded-lg"
                      unoptimized
                    />
                  </div>
                )}
                <h2 className="text-2xl font-bold">{metadata.name}</h2>
                <p className="text-muted text-sm mt-2">{metadata.description}</p>
              </div>

              {/* QR Code */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">QR Code</h3>
                <QRCodeComponent value={batchUrl} size={200} />
                <div className="mt-4">
                  <QRCodeDownloadButton value={batchUrl} size={400} fileName={`batch-${tokenId}-qr`} />
                </div>
              </div>
            </div>

            {/* Right Column - Batch Details */}
            <div className="lg:col-span-2">
              {/* Batch Attributes */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Batch Information</h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted">Token ID</p>
                    <p className="font-semibold">{tokenId}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted">Current Owner</p>
                    <a
                      href={getEtherscanAddressUrl(batchHistory.currentOwner, wallet.chainId || 11155111)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-primary hover:underline"
                    >
                      {formatAddress(batchHistory.currentOwner)}
                    </a>
                  </div>

                  {/* Attributes */}
                  {metadata.attributes && metadata.attributes.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold mb-3">Attributes</h4>
                      <div className="grid gap-3">
                        {metadata.attributes.map((attr, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-muted">{attr.trait_type}</p>
                            <p className="font-semibold">{attr.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-800">Total Steps</p>
                  <p className="text-3xl font-bold text-primary">{batchHistory.steps.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-800">Total Transfers</p>
                  <p className="text-3xl font-bold text-success">{batchHistory.transfers.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <section className="mb-12">
            <Timeline events={batchHistory.timeline} isLoading={isLoading} />
          </section>

          {/* Verification Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">About This Batch</h3>
            <p className="text-sm text-blue-800 mb-3">
              This batch has been recorded on the Ethereum Sepolia testnet with immutable traceability.
              All events are recorded on-chain and can be independently verified.
            </p>
            <p className="text-xs text-blue-700">
              Token Contract: <code className="bg-blue-100 px-2 py-1 rounded">{process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}</code>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
