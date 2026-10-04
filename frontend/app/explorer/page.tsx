"use client";

import { useMemo, useState } from "react";
import { ChevronDown, RefreshCw, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BatchCard } from "@/components/BatchCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useWallet } from "@/context/WalletContext";
import { useBatchRegistry } from "@/hooks/useBatchRegistry";

const FILTER_BOX =
  "flex items-center justify-between gap-3 rounded-lg border border-forest/15 px-4 py-3";
const FILTER_SELECT =
  "w-auto max-w-full appearance-none border-0 bg-transparent p-0 pr-1 text-right text-sm font-medium text-ink";

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}): JSX.Element {
  return (
    <div
      className={`${FILTER_BOX} ${value !== "All" ? "bg-sand" : "bg-paper"}`}
    >
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
        {label}
      </span>
      <span className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <select
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={FILTER_SELECT}
        >
          <option>All</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          size={15}
          className="shrink-0 text-ink/60"
        />
      </span>
    </div>
  );
}

export default function ExplorerPage(): JSX.Element {
  const { wallet } = useWallet();
  const { batches, isLoading, error, reload } = useBatchRegistry();

  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState("All");
  const [material, setMaterial] = useState("All");
  const [status, setStatus] = useState("All");

  const origins = useMemo(
    () => unique(batches.map((b) => b.origin)),
    [batches]
  );
  const materials = useMemo(
    () => unique(batches.map((b) => b.material)),
    [batches]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^#/, "");
    return batches.filter((b) => {
      const text =
        `${b.tokenId} ${b.name} ${b.origin} ${b.material}`.toLowerCase();
      return (
        (!q || text.includes(q)) &&
        (origin === "All" || b.origin === origin) &&
        (material === "All" || b.material === material) &&
        (status === "All" ||
          (status === "Verified" ? b.isVerified : !b.isVerified))
      );
    });
  }, [batches, query, origin, material, status]);

  const hasActiveFilters =
    origin !== "All" || material !== "All" || status !== "All";
  const totalSteps = batches.reduce((sum, b) => sum + b.stepCount, 0);
  const holdings = wallet.address
    ? batches.filter(
        (b) => b.owner.toLowerCase() === wallet.address!.toLowerCase()
      ).length
    : null;

  const stats = [
    { value: batches.length, label: "Batches Registered" },
    { value: totalSteps, label: "Steps Recorded" },
    {
      value: holdings ?? "—",
      label: wallet.address ? "Your Holdings" : "Connect wallet for holdings",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper text-ink">
      <Navbar />
      <main>
        <header className="mx-auto max-w-7xl px-5 pb-14 pt-16 sm:px-6 md:pt-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink/60">
              Craft Registry
            </p>
            <h1 className="mt-5 text-5xl font-bold leading-[0.95] tracking-[-0.045em] sm:text-6xl md:text-7xl">
              Explore Craft Batches
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-ink/60 sm:text-lg">
              Browse and verify the complete provenance record of registered
              craft batches.
            </p>
          </div>
        </header>

        <section
          aria-label="Registry summary"
          className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8"
        >
          <div className="border-b border-forest/15 pb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/60">
              Registry
            </p>
            <div className="mt-6 grid md:grid-cols-3">
              {stats.map((s, i) => (
                <article
                  key={s.label}
                  className={`border-forest/15 py-5 md:py-2 ${i < 2 ? "border-b md:border-b-0 md:border-r" : ""} ${
                    i === 0 ? "md:pr-10" : i === 1 ? "md:px-10" : "md:pl-10"
                  }`}
                >
                  <p className="font-serif text-5xl font-bold leading-none tracking-[-0.04em]">
                    {s.value}
                  </p>
                  <p className="mt-2 text-sm text-ink/60">{s.label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="batches-heading"
          className="mx-auto max-w-7xl px-5 py-12 sm:px-6 md:py-16 lg:px-8"
        >
          <div className="mb-8 flex flex-col gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/60">
                  Archive Catalog
                </p>
                <h2
                  id="batches-heading"
                  className="mt-2 text-3xl font-semibold tracking-[-0.025em] sm:text-4xl"
                >
                  Registered Batches{" "}
                  <span className="font-sans text-base font-medium text-ink/60">
                    ({filtered.length})
                  </span>
                </h2>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-auto">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrigin("All");
                      setMaterial("All");
                      setStatus("All");
                    }}
                    className="rounded-full border border-forest/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-forest hover:bg-sand"
                  >
                    Clear filters
                  </button>
                )}
                <button
                  type="button"
                  onClick={reload}
                  disabled={isLoading}
                  aria-label="Reload batches"
                  className="rounded-full border border-forest/15 p-2.5 text-forest hover:bg-sand"
                >
                  <RefreshCw
                    size={14}
                    className={isLoading ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-forest/15 bg-paper p-3 focus-within:border-forest focus-within:ring-2 focus-within:ring-forest/15">
              <Search
                aria-hidden="true"
                size={20}
                className="shrink-0 text-ink/60"
              />
              <input
                aria-label="Search craft batches"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by Token ID, batch name, origin, or material..."
                className="w-full border-0 bg-transparent p-2 text-sm text-ink placeholder:text-ink/40 focus:border-transparent sm:text-base"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <FilterSelect
                label="Origin"
                value={origin}
                options={origins}
                onChange={setOrigin}
              />
              <FilterSelect
                label="Material"
                value={material}
                options={materials}
                onChange={setMaterial}
              />
              <FilterSelect
                label="Status"
                value={status}
                options={["Verified", "Unverified"]}
                onChange={setStatus}
              />
            </div>
          </div>

          {error && (
            <p className="mb-6 rounded-lg border border-danger/25 bg-sand px-6 py-4 text-sm text-danger">
              Could not load batches: {error}
            </p>
          )}

          {filtered.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((batch) => (
                <BatchCard key={batch.tokenId} batch={batch} />
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-14 text-sm text-ink/60">
              <LoadingSpinner size="sm" />
              <span>Reading batches from Sepolia...</span>
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <p className="rounded-lg border border-dashed border-forest/15 bg-sand px-6 py-14 text-center text-sm italic text-ink/60">
              {batches.length === 0
                ? "No batches have been minted yet."
                : "No craft batches match those filters."}
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
