"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { formatAddress } from "@/lib/contract";
import { WalletModal } from "./WalletModal";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/explorer", label: "Explorer" },
  { href: "/mint", label: "Studio" },
  { href: "/#process", label: "Process" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { wallet } = useWallet();

  return (
    <nav className="sticky top-0 z-40 border-b border-forest/5 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex flex-col">
          <span className="font-serif text-2xl font-bold leading-none tracking-tight text-ink">
            CRAFT-CHAIN
          </span>
          <span className="mt-1 text-[8px] font-black uppercase tracking-[0.4em] text-brass">
            Digital Provenance
          </span>
        </Link>

        <div className="hidden items-center gap-12 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={`text-xs font-bold uppercase tracking-widest transition-colors hover:text-forest ${
                pathname === l.href ? "text-forest" : "text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          {wallet.isConnected && (
            <div className="hidden items-center gap-2 rounded-full bg-sand px-3 py-1 lg:flex">
              <div
                className={`h-2 w-2 rounded-full ${
                  wallet.isCorrectNetwork ? "bg-forest" : "bg-red-500"
                }`}
              />
              <span className="font-mono text-[10px] uppercase text-ink">
                {wallet.isCorrectNetwork ? "Sepolia" : "Wrong Network"}
              </span>
            </div>
          )}

          <button
            onClick={() => setOpen(true)}
            className={`flex items-center gap-3 rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all ${
              wallet.isConnected
                ? "bg-ink text-paper hover:bg-ink/90"
                : "border-2 border-ink text-ink hover:bg-ink hover:text-paper"
            }`}
          >
            {wallet.isConnected ? (
              <>
                <span className="h-2 w-2 rounded-full bg-green-400" />
                {formatAddress(wallet.address || "")}
              </>
            ) : (
              "Connect Wallet"
            )}
          </button>
        </div>
      </div>

      <WalletModal isOpen={open} onClose={() => setOpen(false)} />
    </nav>
  );
}
