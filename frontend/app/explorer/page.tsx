"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function ExplorerPage() {
  const router = useRouter();
  const [tokenId, setTokenId] = useState("");
  const valid = /^\d+$/.test(tokenId.trim());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (valid) router.push(`/batch/${tokenId.trim()}`);
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <p className="eyebrow mb-5">Explorer / 03</p>
        <h1 className="font-serif text-4xl leading-[1.05] tracking-[-0.035em] md:text-6xl">
          Find a batch and read its <em className="font-normal text-forest">journey.</em>
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-7 text-ink/60">
          Enter a batch token ID, or scan the QR code on the product, to see every verified
          step of its chain of custody.
        </p>
        <form onSubmit={submit} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <input
            inputMode="numeric"
            placeholder="Batch token ID, e.g. 1"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            aria-label="Batch token ID"
          />
          <button type="submit" disabled={!valid} className="btn-primary shrink-0">
            <span>Open Batch</span>
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
