import Link from "next/link";

const LINKS = [
  { label: "Overview", href: "/" },
  { label: "Mint Batch", href: "/mint" },
  { label: "Record Step", href: "/record-step" },
  { label: "Explore", href: "/explorer" },
];

export function Footer(): JSX.Element {
  return (
    <footer className="border-t border-forest/15 bg-sand text-ink">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-start">
          <div>
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Craft-Chain home">
              <span className="grid h-9 w-9 place-items-center rounded-md border border-forest text-forest" aria-hidden="true">
                <span className="h-3.5 w-3.5 rotate-45 border border-current" />
              </span>
              <span className="font-serif text-2xl font-bold tracking-[-0.03em]">CRAFT-CHAIN</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-ink/60">
              Transparent provenance for handcrafted goods.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-x-8 gap-y-3 sm:flex sm:flex-wrap sm:justify-end"
          >
            {LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:text-forest"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://sepolia.etherscan.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:text-forest"
            >
              Etherscan
            </a>
          </nav>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-forest/15 pt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/60 md:flex-row md:items-center">
          <p>Craft-Chain · Built for verifiable craft traceability.</p>
          <p>Ethereum Sepolia</p>
        </div>
      </div>
    </footer>
  );
}
