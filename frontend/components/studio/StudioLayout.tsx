"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const TABS = [
  { href: "/mint", label: "Mint New Batch" },
  { href: "/record-step", label: "Record Journey Step" },
];

export function StudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />
      <main>
        <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 md:px-10 md:pt-24 lg:px-16">
          <div className="max-w-3xl border-l-2 border-brass pl-6 md:pl-8">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.28em] text-forest">
              Craft-chain / studio
            </p>
            <h1 className="text-5xl leading-[0.98] md:text-7xl">
              Provenance Studio
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-ink/60 md:text-lg">
              Create a digital record for a new craft batch, or add the next
              verified moment in an existing journey.
            </p>
          </div>

          <div className="mt-16 border-b border-forest/15">
            <div
              className="flex flex-wrap gap-8 md:gap-12"
              role="tablist"
              aria-label="Studio actions"
            >
              {TABS.map((tab) => {
                const active = pathname === tab.href;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    role="tab"
                    aria-selected={active}
                    className={`relative pb-4 text-sm font-semibold transition-colors ${
                      active ? "text-forest" : "text-ink/60 hover:text-ink"
                    }`}
                  >
                    {tab.label}
                    {active && (
                      <span className="absolute bottom-[-1px] left-0 h-0.5 w-full bg-forest" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="pt-12">{children}</div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-ink/60">
      {children}
    </span>
  );
}

export function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-sm text-danger">{message}</p> : null;
}
