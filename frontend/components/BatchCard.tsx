"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { VerificationBadge } from "@/components/VerificationBadge";
import { formatAddress } from "@/lib/contract";
import { getImageUrl } from "@/lib/ipfs";
import { RegistryBatch } from "@/hooks/useBatchRegistry";

const MOTIFS = [
  { stroke: "#21483B", fill: "#D7C9AC", accent: "#B18A52" },
  { stroke: "#6C4B32", fill: "#D9C7AD", accent: "#A85F45" },
  { stroke: "#21483B", fill: "#D6DED9", accent: "#B18A52" },
  { stroke: "#A85F45", fill: "#E3D8C9", accent: "#21483B" },
  { stroke: "#7A5634", fill: "#D6B98C", accent: "#21483B" },
];

function Illustration({ tokenId, name }: { tokenId: number; name: string }): JSX.Element {
  const m = MOTIFS[tokenId % MOTIFS.length];
  return (
    <svg className="h-64 w-full rounded-md bg-paper" viewBox="0 0 360 420" role="img" aria-label={name}>
      <rect width="360" height="420" rx="10" fill="#F7F4EE" />
      <path d="M62 336 C110 294, 125 263, 182 276 C229 287, 254 250, 302 219" fill="none" stroke={m.accent} strokeWidth="3" strokeLinecap="round" opacity="0.42" />
      <path d="M82 112 C130 72, 214 68, 268 113 C306 145, 303 224, 258 269 C214 313, 128 315, 84 265 C42 217, 42 147, 82 112Z" fill={m.fill} />
      <path d="M91 122 C138 87, 209 84, 256 123 C290 153, 286 216, 247 254 C209 292, 139 293, 101 253 C63 212, 60 153, 91 122Z" fill="none" stroke={m.stroke} strokeWidth="3" opacity="0.82" />
      <path d="M113 151 C145 132, 205 130, 238 154" fill="none" stroke={m.stroke} strokeWidth="2" strokeLinecap="round" opacity="0.62" />
      <path d="M98 203 C137 221, 217 221, 262 199" fill="none" stroke={m.stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M128 276 C151 241, 157 171, 137 96" fill="none" stroke={m.accent} strokeWidth="2" strokeLinecap="round" opacity="0.65" />
      <path d="M215 279 C198 239, 197 170, 222 98" fill="none" stroke={m.accent} strokeWidth="2" strokeLinecap="round" opacity="0.65" />
      <circle cx="286" cy="98" r="8" fill={m.accent} opacity="0.72" />
      <circle cx="75" cy="303" r="5" fill={m.stroke} opacity="0.38" />
    </svg>
  );
}

export function BatchCard({ batch }: { batch: RegistryBatch }): JSX.Element {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = batch.metadata?.image ? getImageUrl(batch.metadata.image) : "";

  return (
    <Link
      href={`/batch/${batch.tokenId}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-forest/15 bg-sand shadow-[0_10px_28px_rgba(31,36,33,0.035)] transition duration-300 hover:border-forest/45 hover:shadow-[0_18px_36px_rgba(31,36,33,0.09)]"
    >
      <figure className="border-b border-forest/15 bg-sand p-5">
        {imageUrl && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={batch.name}
            onError={() => setImageFailed(true)}
            className="h-64 w-full rounded-md bg-paper object-cover"
          />
        ) : (
          <Illustration tokenId={batch.tokenId} name={batch.name} />
        )}
      </figure>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brass">
          #{String(batch.tokenId).padStart(5, "0")}
        </p>
        <h3 className="mt-3 font-serif text-2xl font-semibold leading-[1.08] tracking-[-0.025em] text-ink">
          {batch.name}
        </h3>
        {batch.origin && (
          <p className="mt-4 flex items-center gap-2 text-sm text-ink/60">
            <MapPin aria-hidden="true" size={15} strokeWidth={1.8} />
            <span>{batch.origin}</span>
          </p>
        )}
        {batch.material && (
          <div className="mt-4">
            <span className="inline-flex rounded-full border border-forest/15 bg-paper px-3 py-1 text-xs font-medium text-ink">
              {batch.material}
            </span>
          </div>
        )}
        <div className="mt-auto flex flex-col gap-3 border-t border-forest/15 pt-5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
          <span className="font-mono text-xs text-ink/60">{formatAddress(batch.owner)}</span>
          <VerificationBadge size="sm" verified={batch.isVerified} />
        </div>
      </div>
    </Link>
  );
}
