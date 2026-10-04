import { Check, CheckCircle2, Circle, Clock3, ArrowUpRight, WalletCards } from "lucide-react";
import Link from "next/link";

export const PHASES = ["Preparing", "Waiting for Wallet", "Confirming", "Success"] as const;

export function TransactionPanel({ phase, failed }: { phase: number; failed?: boolean }): JSX.Element {
  return (
    <div className="border border-forest/15 p-6 md:p-7">
      <div className="mb-6 flex items-center gap-3">
        <WalletCards size={19} className="text-forest" />
        <h2 className="text-2xl">Transaction Status</h2>
      </div>
      <ol className="space-y-4">
        {PHASES.map((name, i) => {
          const complete = i < phase || (i === phase && name === "Success");
          const current = i === phase && !complete;
          return (
            <li
              key={name}
              className={`flex items-center gap-3 text-sm ${
                current ? (failed ? "font-semibold text-danger" : "font-semibold text-forest") : complete ? "text-ink" : "text-ink/40"
              }`}
            >
              {complete ? <CheckCircle2 size={16} /> : current ? <Clock3 size={16} /> : <Circle size={16} />}
              <span>{name}</span>
              {current && (
                <span className="ml-auto text-[10px] uppercase tracking-widest">{failed ? "Failed" : "Current"}</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function SuccessCard({
  title,
  rows,
  href = "/explorer",
}: {
  title: string;
  rows: { label: string; value: string }[];
  href?: string;
}): JSX.Element {
  return (
    <div className="border border-forest bg-forest/10 p-6">
      <div className="flex items-center gap-2 text-forest">
        <Check size={18} />
        <h2 className="text-xl">{title}</h2>
      </div>
      <dl className="mt-5 space-y-3 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-4">
            <dt className="text-ink/60">{r.label}</dt>
            <dd className="break-all text-right font-mono text-xs">{r.value}</dd>
          </div>
        ))}
      </dl>
      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-forest underline underline-offset-4"
      >
        View batch <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}
