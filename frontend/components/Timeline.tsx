"use client";

import { TimelineEvent } from "@/types";
import { formatAddress } from "@/lib/contract";
import { VerificationBadge } from "./VerificationBadge";

interface TimelineProps {
  events: TimelineEvent[];
  isLoading?: boolean;
}

const panel = "border border-forest/10 bg-white p-8";

export function Timeline({ events, isLoading = false }: TimelineProps) {
  if (isLoading) {
    return (
      <div className={panel}>
        <div className="flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-forest" />
        </div>
        <p className="mt-4 text-center text-sm text-ink/60">Loading timeline...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={`${panel} text-center`}>
        <p className="text-sm text-ink/60">No events recorded yet</p>
      </div>
    );
  }

  return (
    <div className={panel}>
      <p className="eyebrow mb-2">Chain of custody</p>
      <h2 className="mb-10 font-serif text-3xl font-semibold">Batch Timeline</h2>

      <div className="relative">
        <div className="absolute bottom-0 left-[5px] top-0 w-px bg-forest/15" />

        <div className="space-y-6">
          {events.map((event, index) => (
            <div key={index} className="relative pl-10">
              <div className="absolute left-0 top-2 h-[11px] w-[11px] rounded-full border-2 border-paper bg-forest" />

              <div className="border border-forest/10 bg-paper/60 p-5">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brass">
                    {new Date(event.timestamp * 1000).toLocaleDateString(undefined, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {event.type === "step" && event.step.hashVerified && (
                    <VerificationBadge size="sm" />
                  )}
                </div>

                {event.type === "transfer" ? (
                  <>
                    <h3 className="mb-3 font-serif text-xl font-semibold">Ownership Transfer</h3>
                    <Row label="From" value={formatAddress(event.from)} mono />
                    <Row label="To" value={formatAddress(event.to)} mono />
                  </>
                ) : (
                  <>
                    <h3 className="mb-1 font-serif text-xl font-semibold">
                      {event.step.stepData?.stepType || "Processing Step"}
                    </h3>
                    <p className="mb-4 text-sm text-ink/60">
                      {event.step.stepData?.description || "N/A"}
                    </p>
                    <Row label="Location" value={event.step.stepData?.location || "N/A"} />
                    <Row label="Actor" value={formatAddress(event.step.actor)} mono />
                  </>
                )}

                {event.transactionHash && (
                  <div className="mt-4 border-t border-forest/5 pt-4">
                    <a
                      href={`https://sepolia.etherscan.io/tx/${event.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-forest hover:underline"
                    >
                      TX: {event.transactionHash.slice(0, 10)}...{event.transactionHash.slice(-8)}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="uppercase tracking-tighter text-ink/40">{label}</span>
      <span className={`font-medium ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
