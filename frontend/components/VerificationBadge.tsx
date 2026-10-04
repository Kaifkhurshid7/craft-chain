import { ShieldCheck } from "lucide-react";

const SIZES = {
  sm: { box: "px-2 py-0.5 text-[10px]", icon: 12 },
  md: { box: "px-2.5 py-1 text-xs", icon: 14 },
  lg: { box: "px-4 py-1.5 text-sm", icon: 16 },
};

export function VerificationBadge({ size = "md" }: { size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border border-forest/20 bg-forest/10 font-medium text-forest ${s.box}`}
    >
      <ShieldCheck size={s.icon} strokeWidth={1.8} />
      <span className="tracking-wide">VERIFIED ON SEPOLIA</span>
    </div>
  );
}
