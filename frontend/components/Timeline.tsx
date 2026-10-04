"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { TimelineEvent } from "@/types";
import { formatAddress } from "@/lib/contract";

interface TimelineProps {
  events: TimelineEvent[];
  isLoading?: boolean;
}

function Shell({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <section
      aria-labelledby="chain-of-custody-heading"
      className="rounded-lg border border-forest/15 bg-paper shadow-[0_12px_34px_rgba(31,36,33,0.04)]"
    >
      <div className="border-b border-forest/15 px-5 py-4 md:px-6">
        <h2
          id="chain-of-custody-heading"
          className="font-sans text-[10px] font-bold uppercase tracking-[0.24em] text-ink/60"
        >
          Chain of custody
        </h2>
      </div>
      {children}
    </section>
  );
}

export function Timeline({
  events,
  isLoading = false,
}: TimelineProps): JSX.Element {
  if (isLoading) {
    return (
      <Shell>
        <p className="px-6 py-10 text-center text-sm text-ink/60">
          Loading timeline...
        </p>
      </Shell>
    );
  }

  if (events.length === 0) {
    return (
      <Shell>
        <p className="px-6 py-10 text-center text-sm text-ink/60">
          No events recorded yet
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="px-5 py-6 md:px-6 md:py-8">
        <ol>
          {events.map((event, index) => {
            const isLast = index === events.length - 1;
            const isStep = event.type === "step";
            const title = isStep
              ? event.step.stepData?.stepType || "Step Recorded"
              : "Ownership Transfer";
            const pill = isStep ? "Step" : "Transfer";
            const verified = isStep && (event.step.hashVerified ?? true);
            const location = isStep ? event.step.stepData?.location : undefined;
            const description = isStep
              ? event.step.stepData?.description
              : undefined;
            const actor = isStep ? event.step.actor : undefined;

            return (
              <li
                key={index}
                className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 md:grid-cols-[4rem_minmax(0,1fr)] md:gap-6"
              >
                <div className="flex flex-col items-center">
                  <span className="font-serif text-xl font-bold text-brass">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {!isLast ? (
                    <span
                      className="mt-3 min-h-16 flex-1 border-l border-forest/15"
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="mt-3 h-6" aria-hidden="true" />
                  )}
                </div>

                <article className="mb-6 rounded-lg border border-forest/15 bg-sand p-5 shadow-[0_8px_24px_rgba(31,36,33,0.035)] md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full border border-forest/20 bg-paper px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-forest">
                      {pill}
                    </span>
                    {verified ? (
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-forest">
                        ✓ Verified
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-bold tracking-[-0.02em]">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm text-ink/60">
                        {new Date(event.timestamp * 1000).toLocaleDateString(
                          undefined,
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                      {description && (
                        <p className="mt-3 text-sm text-ink/70">
                          {description}
                        </p>
                      )}
                      {location && (
                        <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium">
                          <MapPin
                            size={15}
                            strokeWidth={1.7}
                            className="text-ink/60"
                            aria-hidden="true"
                          />
                          <span>{location}</span>
                        </p>
                      )}
                      {event.type === "transfer" && (
                        <p className="mt-3 font-mono text-xs text-ink/70">
                          {formatAddress(event.from)} →{" "}
                          {formatAddress(event.to)}
                        </p>
                      )}
                      {actor && (
                        <p className="mt-3 font-mono text-xs text-ink/60">
                          By {formatAddress(actor)}
                        </p>
                      )}
                    </div>

                    {event.transactionHash && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${event.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-xs text-forest transition-colors hover:text-ink"
                      >
                        <span>
                          {event.transactionHash.slice(0, 6)}...
                          {event.transactionHash.slice(-4)}
                        </span>
                        <ExternalLink
                          size={13}
                          strokeWidth={1.7}
                          aria-hidden="true"
                        />
                      </a>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </Shell>
  );
}
