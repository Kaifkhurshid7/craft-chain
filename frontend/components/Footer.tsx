import Link from "next/link";

const ETHERSCAN = "https://sepolia.etherscan.io";

export function Footer() {
  const year = new Date().getFullYear();
  const linkCls = "text-sm text-ink/70 transition-colors hover:text-ink";
  const legalCls = "text-[10px] uppercase tracking-widest text-ink/40 hover:text-ink";

  return (
    <footer className="border-t border-forest/10 bg-sand pb-10 pt-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <h2 className="mb-6 font-serif text-3xl font-bold tracking-tighter">CRAFT-CHAIN</h2>
            <p className="max-w-sm leading-relaxed text-ink/60">
              Bridging the gap between timeless craftsmanship and future-ready technology.
              Verifying authenticity, one block at a time.
            </p>
          </div>

          <div>
            <h4 className="mb-6 font-sans text-[10px] font-black uppercase tracking-[0.2em] text-forest">
              Platform
            </h4>
            <ul className="space-y-4">
              <li><Link href="/explorer" className={linkCls}>Explorer</Link></li>
              <li><Link href="/mint" className={linkCls}>Studio</Link></li>
              <li><Link href="/record-step" className={linkCls}>Verify</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-sans text-[10px] font-black uppercase tracking-[0.2em] text-forest">
              Network Status
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-forest" />
                <span className="text-xs text-ink/70">Mainnet: Operational</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-brass" />
                <span className="text-xs text-ink/70">Sepolia: Active (Default)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-forest/5 pt-8 md:flex-row">
          <div className="text-[10px] uppercase tracking-widest text-ink/40">
            © {year} CRAFT-CHAIN DIGITAL PROVENANCE LTD.
          </div>
          <div className="flex gap-8">
            <a href="#" className={legalCls}>Legal</a>
            <a href={ETHERSCAN} target="_blank" rel="noopener noreferrer" className={legalCls}>Etherscan</a>
            <a href="https://status.ipfs.io" target="_blank" rel="noopener noreferrer" className={legalCls}>IPFS Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
