"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({
  value,
  label,
}: {
  value: string;
  label: string;
}): JSX.Element {
  const [copied, setCopied] = useState(false);

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable (insecure context); fail silently
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className="rounded-full border border-forest/15 p-2 text-forest transition-colors hover:border-forest"
    >
      {copied ? (
        <Check size={14} strokeWidth={1.8} />
      ) : (
        <Copy size={14} strokeWidth={1.7} />
      )}
    </button>
  );
}
