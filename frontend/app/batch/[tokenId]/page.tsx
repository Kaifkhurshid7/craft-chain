"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Timeline } from "@/components/Timeline";
import { QRCodeComponent, QRCodeDownloadButton } from "@/components/QRCode";
import { VerificationBadge } from "@/components/VerificationBadge";
import { CopyButton } from "@/components/CopyButton";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Alert } from "@/components/Alert";
import { useContract } from "@/context/ContractContext";
import { BatchHistory, DEFAULT_BATCH_METADATA } from "@/types";
import {
  formatAddress,
  getEtherscanAddressUrl,
  getEtherscanTokenUrl,
} from "@/lib/contract";
import { getImageUrl } from "@/lib/ipfs";

interface BatchDetailsPageProps {
  params: {
    tokenId: string;
  };
}

const CARD =
  "rounded-lg border border-forest/15 bg-sand shadow-[0_12px_34px_rgba(31,36,33,0.04)]";
const CARD_TITLE =
  "font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-ink/60";
const LINK =
  "inline-flex items-center gap-2 text-sm font-bold text-forest transition-colors hover:text-ink";
const ACTION =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-forest/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:border-forest hover:text-forest";

function Page({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

function attr(
  attributes: { trait_type: string; value: string }[] | undefined,
  trait: string
): string {
  return attributes?.find((a) => a.trait_type === trait)?.value || "";
}

export default function BatchDetailsPage({
  params,
}: BatchDetailsPageProps): JSX.Element {
  const { getBatchHistory, isLoading } = useContract();
  const [batchHistory, setBatchHistory] = useState<BatchHistory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  const tokenId = parseInt(params.tokenId, 10);
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://craft-chain.vercel.app";
  const batchUrl = `${baseUrl}/batch/${tokenId}`;
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

  useEffect(() => {
    const fetchBatchData = async (): Promise<void> => {
      try {
        const data = await getBatchHistory(tokenId);
        if (data) {
          setBatchHistory(data);
        } else {
          setError("Batch not found");
        }
      } catch (err: unknown) {
        const e = err as { message?: string };
        setError(e.message || "Failed to load batch");
      }
    };

    if (!isNaN(tokenId) && tokenId > 0) {
      fetchBatchData();
    } else {
      setError("Invalid token ID");
    }
  }, [tokenId, getBatchHistory]);

  if (error) {
    return (
      <Page>
        <main className="mx-auto max-w-4xl px-5 py-16 md:px-8">
          <Alert
            type="error"
            title="Error"
            message={error}
            dismissible={false}
          />
          <Link href="/explorer" className={`${LINK} mt-6`}>
            Back to explorer
          </Link>
        </main>
      </Page>
    );
  }

  if (!batchHistory || isLoading) {
    return (
      <Page>
        <main className="mx-auto flex max-w-4xl justify-center px-5 py-24">
          <LoadingSpinner size="lg" message="Loading batch details..." />
        </main>
      </Page>
    );
  }

  const metadata = batchHistory.batch.metadata || DEFAULT_BATCH_METADATA;
  const imageUrl = metadata.image ? getImageUrl(metadata.image) : "";
  const cid = batchHistory.batch.metadataURI.replace("ipfs://", "");
  const origin = attr(metadata.attributes, "Origin");
  const productionDate = attr(metadata.attributes, "Production Date");
  const idLabel = `#${String(tokenId).padStart(5, "0")}`;
  const isVerified = batchHistory.steps.length > 0;

  return (
    <Page>
      <main>
        <section className="mx-auto max-w-7xl px-5 pb-10 pt-14 md:px-8 md:pb-14 md:pt-20 lg:px-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-ink/60">
            <Link href="/explorer" className="hover:text-forest">
              Explore
            </Link>{" "}
            / Batch {idLabel}
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-[0.96] tracking-[-0.045em] md:text-7xl lg:text-8xl">
            {metadata.name}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink/60 md:text-base">
            <span>Batch {idLabel}</span>
            {origin && (
              <>
                <span aria-hidden="true">·</span>
                <span>{origin}</span>
              </>
            )}
            {productionDate && (
              <>
                <span aria-hidden="true">·</span>
                <span>Production Date: {productionDate}</span>
              </>
            )}
            <VerificationBadge size="sm" verified={isVerified} />
          </div>

          <div className="mt-10 flex flex-col justify-between gap-5 border-t border-forest/15 pt-6 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
                Current Owner
              </p>
              <div className="mt-2 flex items-center gap-2">
                <a
                  href={getEtherscanAddressUrl(batchHistory.currentOwner)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm hover:text-forest"
                >
                  {formatAddress(batchHistory.currentOwner)}
                </a>
                <CopyButton
                  value={batchHistory.currentOwner}
                  label="Copy current owner address"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {contractAddress && (
                <a
                  href={getEtherscanTokenUrl(contractAddress, tokenId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ACTION}
                >
                  <span>View on Etherscan</span>
                  <ExternalLink
                    size={14}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </a>
              )}
              <QRCodeDownloadButton
                value={batchUrl}
                size={400}
                fileName={`batch-${tokenId}-qr`}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-16 md:px-8 md:pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.62fr)] lg:px-10">
          <div className="space-y-10">
            {imageUrl && !imageFailed && (
              <figure>
                <div className={`${CARD} overflow-hidden p-4 md:p-6`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={metadata.name}
                    onError={() => setImageFailed(true)}
                    className="max-h-[720px] w-full rounded-md bg-sand object-cover"
                  />
                </div>
                {metadata.description && (
                  <figcaption className="mt-3 text-xs font-medium text-ink/60">
                    {metadata.description}
                  </figcaption>
                )}
              </figure>
            )}

            {metadata.attributes && metadata.attributes.length > 0 && (
              <section
                aria-labelledby="product-information-heading"
                className="rounded-lg border border-forest/15 bg-paper shadow-[0_12px_34px_rgba(31,36,33,0.04)]"
              >
                <div className="border-b border-forest/15 px-5 py-4 md:px-6">
                  <h2 id="product-information-heading" className={CARD_TITLE}>
                    PRODUCT INFORMATION
                  </h2>
                </div>
                <dl className="grid md:grid-cols-2">
                  {metadata.attributes.map((item, i) => (
                    <div
                      key={`${item.trait_type}-${i}`}
                      className="border-b border-forest/10 px-5 py-5 md:px-6 md:odd:border-r"
                    >
                      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/60">
                        {item.trait_type}
                      </dt>
                      <dd className="mt-2 text-base font-medium">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <Timeline events={batchHistory.timeline} isLoading={isLoading} />
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <section
              aria-labelledby="qr-heading"
              className={`${CARD} p-6 md:p-7`}
            >
              <h2 id="qr-heading" className={CARD_TITLE}>
                SCAN TO VERIFY PROVENANCE
              </h2>
              <div className="mt-7 flex justify-center">
                <QRCodeComponent value={batchUrl} size={180} />
              </div>
              <p className="mt-6 text-center font-serif text-3xl font-bold tracking-[-0.03em] text-brass">
                {idLabel}
              </p>
              <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-6 text-ink/60">
                Scan this code to view the public provenance record for this
                batch.
              </p>
              <p className="mt-7 border-t border-forest/15 pt-5 text-center text-[10px] font-bold uppercase tracking-[0.2em]">
                CRAFT-CHAIN · SEPOLIA NETWORK
              </p>
            </section>

            <section
              aria-labelledby="record-heading"
              className={`${CARD} p-5 md:p-6`}
            >
              <h2 id="record-heading" className={CARD_TITLE}>
                BLOCKCHAIN RECORD
              </h2>
              <dl className="mt-5 divide-y divide-forest/15">
                <Row label="Token ID" value={String(tokenId)} />
                {contractAddress && (
                  <Row
                    label="Contract"
                    value={formatAddress(contractAddress)}
                    copy={contractAddress}
                  />
                )}
                <Row label="Network" value="Ethereum Sepolia" />
                <Row label="Steps" value={String(batchHistory.steps.length)} />
                <Row
                  label="Transfers"
                  value={String(batchHistory.transfers.length)}
                />
              </dl>
              {contractAddress && (
                <a
                  href={getEtherscanTokenUrl(contractAddress, tokenId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${LINK} mt-5`}
                >
                  <span>View on Etherscan</span>
                  <ExternalLink
                    size={15}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </a>
              )}
            </section>

            {cid && (
              <section
                aria-labelledby="ipfs-heading"
                className={`${CARD} p-5 md:p-6`}
              >
                <h2 id="ipfs-heading" className={CARD_TITLE}>
                  IPFS METADATA
                </h2>
                <div className="mt-5 flex items-center justify-between gap-4 rounded-md border border-forest/15 bg-paper px-4 py-3">
                  <p className="font-mono text-sm">
                    {cid.length > 14
                      ? `${cid.slice(0, 6)}...${cid.slice(-4)}`
                      : cid}
                  </p>
                  <CopyButton value={cid} label="Copy IPFS CID" />
                </div>
                <a
                  href={getImageUrl(batchHistory.batch.metadataURI)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${LINK} mt-5`}
                >
                  <span>View on IPFS</span>
                  <ExternalLink
                    size={15}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </a>
                <p className="mt-4 text-sm leading-6 text-ink/60">
                  Metadata stored on IPFS, hash recorded on-chain.
                </p>
              </section>
            )}
          </aside>
        </section>
      </main>
    </Page>
  );
}

function Row({
  label,
  value,
  copy,
}: {
  label: string;
  value: string;
  copy?: string;
}): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/60">
        {label}
      </dt>
      <dd className="flex items-center gap-2 text-right font-mono text-sm">
        <span>{value}</span>
        {copy && <CopyButton value={copy} label={`Copy ${label}`} />}
      </dd>
    </div>
  );
}
