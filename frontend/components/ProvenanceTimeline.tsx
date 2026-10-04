import { VerificationBadge } from "./VerificationBadge";

export interface ProvenanceEvent {
  id: string;
  type: string;
  actor: string;
  location: string;
  date: string;
  description: string;
  txHash?: string;
  status: "completed" | "current" | "upcoming";
}

export function ProvenanceTimeline({ events }: { events: ProvenanceEvent[] }) {
  return (
    <div className="py-8">
      <div className="relative">
        <div className="absolute bottom-0 left-4 top-0 w-px bg-forest/10 md:left-1/2 md:-ml-px" />

        <div className="space-y-12">
          {events.map((event, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={event.id} className="relative flex flex-col items-center md:flex-row">
                <div className={`flex w-full items-center ${isEven ? "md:flex-row-reverse" : ""}`}>
                  <div
                    className={`w-full pl-12 md:w-1/2 md:pl-0 ${
                      isEven ? "md:pl-12" : "text-right md:pr-12"
                    }`}
                  >
                    <div
                      className={`border border-forest/10 bg-white p-6 transition-all hover:shadow-lg ${
                        event.status === "current" ? "ring-1 ring-forest" : ""
                      }`}
                    >
                      <div className={`mb-2 flex items-center gap-3 ${!isEven ? "md:justify-end" : ""}`}>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brass">
                          {event.date}
                        </span>
                        {event.status === "completed" && <VerificationBadge size="sm" />}
                      </div>

                      <h4 className="mb-1 font-serif text-xl font-semibold">{event.type}</h4>
                      <p className="mb-4 text-sm text-ink/60">{event.description}</p>

                      <div className={`flex flex-col gap-1 text-xs text-ink/80 ${!isEven ? "md:items-end" : ""}`}>
                        <div className="flex items-center gap-2">
                          <span className="uppercase tracking-tighter text-ink/40">Actor</span>
                          <span className="font-medium">{event.actor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="uppercase tracking-tighter text-ink/40">Location</span>
                          <span className="font-medium">{event.location}</span>
                        </div>
                      </div>

                      {event.txHash && (
                        <div className={`mt-4 flex border-t border-forest/5 pt-4 ${!isEven ? "md:justify-end" : ""}`}>
                          <a
                            href={`https://sepolia.etherscan.io/tx/${event.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[10px] text-forest hover:underline"
                          >
                            TX: {event.txHash.slice(0, 10)}...{event.txHash.slice(-8)}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="absolute left-4 flex -translate-x-1/2 items-center justify-center md:left-1/2">
                    <div
                      className={`h-3 w-3 rounded-full border-2 border-paper ${
                        event.status === "completed"
                          ? "bg-forest"
                          : event.status === "current"
                            ? "animate-pulse bg-brass"
                            : "bg-sand"
                      }`}
                    />
                  </div>

                  <div className="hidden md:block md:w-1/2" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
