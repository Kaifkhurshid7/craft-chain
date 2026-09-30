"use client";

import { TimelineEvent } from "@/types";
import { formatAddress } from "@/lib/contract";

interface TimelineProps {
  events: TimelineEvent[];
  isLoading?: boolean;
}

export function Timeline({ events, isLoading = false }: TimelineProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <p className="text-center text-muted mt-4">Loading timeline...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-muted">No events recorded yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-2xl font-bold mb-8">Batch Timeline</h2>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-[30px] top-0 bottom-0 w-1 bg-primary opacity-30"></div>

        {/* Timeline Events */}
        <div className="space-y-8">
          {events.map((event, index) => (
            <div key={index} className="relative pl-20">
              {/* Timeline Dot */}
              <div className="absolute left-0 top-2 w-16 h-16 bg-white border-4 border-primary rounded-full flex items-center justify-center">
                {event.type === "transfer" ? "📤" : "🔗"}
              </div>

              {/* Event Content */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {event.type === "transfer" ? (
                  <>
                    <h3 className="font-semibold text-lg mb-2">
                      Ownership Transfer
                    </h3>
                    <p className="text-sm text-muted mb-2">
                      From:{" "}
                      <span className="font-mono text-dark">
                        {formatAddress(event.from)}
                      </span>
                    </p>
                    <p className="text-sm text-muted mb-3">
                      To:{" "}
                      <span className="font-mono text-dark">
                        {formatAddress(event.to)}
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-lg mb-2">
                      {event.step.stepData?.stepType || "Processing Step"}
                    </h3>
                    <p className="text-sm text-muted mb-2">
                      <strong>Description:</strong>{" "}
                      {event.step.stepData?.description || "N/A"}
                    </p>
                    <p className="text-sm text-muted mb-2">
                      <strong>Location:</strong>{" "}
                      {event.step.stepData?.location || "N/A"}
                    </p>
                    <p className="text-sm text-muted mb-2">
                      <strong>Actor:</strong>{" "}
                      <span className="font-mono">
                        {formatAddress(event.step.actor)}
                      </span>
                    </p>
                    {event.step.hashVerified && (
                      <div className="mt-2 text-xs text-success font-semibold">
                        ✓ Hash Verified
                      </div>
                    )}
                  </>
                )}

                {/* Timestamp */}
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <p className="text-xs text-muted">
                    {new Date(event.timestamp * 1000).toLocaleString()}
                  </p>
                  {event.transactionHash && (
                    <p className="text-xs text-primary font-mono mt-1">
                      TX: {event.transactionHash.slice(0, 10)}...
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
