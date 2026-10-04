import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  CheckCircle2,
  ClipboardPenLine,
  FileCheck2,
  Fingerprint,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ProvenanceTimeline, ProvenanceEvent } from "@/components/ProvenanceTimeline";

const heroEvents: ProvenanceEvent[] = [
  {
    id: "artisan",
    type: "Artisan",
    actor: "Ama Mensah",
    location: "Kumasi, Ghana",
    date: "03 APR 2024",
    description: "Origin recorded · Handwoven raffia basket",
    txHash: "0x8f4e7b91a2c3d4e5f60123456789abcd",
    status: "completed",
  },
  {
    id: "co-op",
    type: "Co-op",
    actor: "Kente Collective",
    location: "Accra, Ghana",
    date: "09 APR 2024",
    description: "Quality inspection and custody transfer",
    txHash: "0x44b1c7de3098f11a23567789abcd0123",
    status: "completed",
  },
  {
    id: "retailer",
    type: "Retailer",
    actor: "Hearth & Hand",
    location: "London, UK",
    date: "22 APR 2024",
    description: "Received and verified for sale",
    status: "current",
  },
];

const stats = [
  { value: "1,284", label: "Batches Registered" },
  { value: "8,691", label: "Verified Steps" },
  { value: "342", label: "Active Records" },
  { value: "Sepolia", label: "Network" },
];

const steps = [
  { n: "01", title: "Mint", text: "Create a unique batch identity.", Icon: Fingerprint },
  { n: "02", title: "Document", text: "Preserve the story behind the work.", Icon: ClipboardPenLine },
  { n: "03", title: "Record", text: "Anchor evidence to blockchain and IPFS.", Icon: Blocks },
  { n: "04", title: "Transfer", text: "Trace custody at every handoff.", Icon: Truck },
  { n: "05", title: "Verify", text: "Let anyone confirm what is true.", Icon: FileCheck2 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 pb-24 pt-20 md:px-12 md:pt-28 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.8fr)] lg:items-center lg:gap-20 lg:px-16 lg:pb-32">
          <div>
            <div className="eyebrow mb-8 flex items-center gap-3 tracking-[0.28em]">
              <span className="h-px w-8 bg-brass" />
              <span>Digital provenance / 01</span>
            </div>
            <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              Every craft has a journey.{" "}
              <em className="font-normal text-forest">Make it verifiable.</em>
            </h1>
            <p className="mt-9 max-w-xl text-base leading-8 text-ink/65 md:text-lg">
              Craft-Chain records the provenance and custody of handcrafted product batches
              using blockchain and IPFS.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/mint" className="btn-primary">
                <span>Mint a Batch</span>
                <ArrowRight size={16} strokeWidth={1.5} />
              </Link>
              <Link href="/explorer" className="btn-outline">
                <span>Explore a Batch</span>
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="mt-14 flex items-center gap-3 text-xs text-ink/50">
              <ShieldCheck size={17} className="text-forest" strokeWidth={1.5} />
              <span>Immutable records. Human stories.</span>
            </div>
          </div>

          <div className="relative border border-forest/15 bg-sand/45 px-4 py-5 sm:px-8 sm:py-7">
            <div className="mb-2 flex items-center justify-between border-b border-forest/10 pb-5">
              <div>
                <p className="eyebrow tracking-[0.24em]">Live record</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold">Batch #CC-0428</h2>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full border border-forest/20 text-forest"
                aria-label="Verified batch"
              >
                <CheckCircle2 size={20} strokeWidth={1.4} />
              </div>
            </div>
            <div className="mb-1 flex items-center justify-between pt-1 text-[10px] uppercase tracking-[0.16em] text-ink/45">
              <span>Chain of custody</span>
              <span>Sepolia / IPFS</span>
            </div>
            <div className="-mx-4 sm:-mx-8 [&>div]:py-2 [&_.space-y-12]:space-y-5 [&_.p-6]:rounded-none [&_.p-6]:bg-white/70 [&_.p-6]:p-4 [&_.p-6]:shadow-none [&_.text-sm]:text-xs [&_.text-xl]:text-lg">
              <ProvenanceTimeline events={heroEvents} />
            </div>
            <div className="flex items-center justify-between border-t border-forest/10 pt-4 text-[10px] uppercase tracking-[0.16em] text-ink/45">
              <span>3 verified steps</span>
              <span className="font-mono normal-case tracking-normal text-forest">0x8f4e...abcd</span>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section
          aria-label="Craft-Chain network statistics"
          className="border-y border-forest/10 bg-sand/35"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-7 px-6 py-10 md:grid-cols-4 md:gap-y-0 md:px-12 lg:px-16">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`px-4 md:px-8 ${i === 0 ? "pl-0 md:pl-0" : ""} ${
                  i < stats.length - 1 ? "border-forest/10 max-md:odd:border-r md:border-r" : ""
                }`}
              >
                <p className="font-serif text-3xl md:text-4xl">{s.value}</p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-ink/50">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Method */}
        <section id="process" className="mx-auto max-w-7xl px-6 py-24 md:px-12 md:py-32 lg:px-16">
          <div className="grid gap-14 lg:grid-cols-[0.62fr_1.38fr] lg:gap-24">
            <div>
              <p className="eyebrow mb-5">The method / 02</p>
              <h2 className="max-w-sm font-serif text-4xl leading-[1.05] tracking-[-0.035em] md:text-5xl">
                A clearer chain from hand to home.
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-7 text-ink/60">
                One considered record for every meaningful moment. Craft-Chain gives makers
                and collectors a shared language for trust.
              </p>
            </div>
            <ol className="grid grid-cols-1 divide-y divide-forest/10 border-y border-forest/10">
              {steps.map(({ n, title, text, Icon }) => (
                <li key={n} className="grid grid-cols-[52px_1fr_auto] items-center gap-5 py-6">
                  <span className="font-mono text-xs text-brass">{n}</span>
                  <div>
                    <h3 className="font-serif text-xl font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-ink/55">{text}</p>
                  </div>
                  <Icon size={22} className="text-forest" strokeWidth={1.3} />
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-6 mb-24 border border-forest/10 bg-forest px-7 py-12 text-paper md:mx-12 md:px-14 lg:mx-auto lg:max-w-7xl lg:px-20">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em] text-[#D4AF75]">
                Begin the record
              </p>
              <h2 className="max-w-xl font-serif text-3xl leading-tight md:text-4xl">
                Give every object a story that can be trusted.
              </h2>
            </div>
            <Link
              href="/mint"
              className="inline-flex shrink-0 items-center gap-3 border border-paper/35 px-6 py-4 text-xs font-bold uppercase tracking-[0.17em] transition-colors hover:bg-paper hover:text-forest"
            >
              <span>Mint a Batch</span>
              <Sparkles size={15} strokeWidth={1.5} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
