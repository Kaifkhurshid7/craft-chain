import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import { Providers } from "@/context/Providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Craft-Chain - Blockchain Batch Traceability",
  description:
    "Transparent and verifiable supply chain traceability for handcrafted products using blockchain and IPFS",
  keywords: [
    "blockchain",
    "traceability",
    "supply chain",
    "NFT",
    "ERC-721",
    "handcraft",
    "craft",
  ],
  authors: [{ name: "Craft-Chain Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://craft-chain.vercel.app",
    title: "Craft-Chain - Blockchain Batch Traceability",
    description:
      "Transparent and verifiable supply chain traceability for handcrafted products",
    siteName: "Craft-Chain",
  },
  twitter: {
    card: "summary_large_image",
    title: "Craft-Chain",
    description: "Blockchain-based craft batch traceability system",
  },
};

const serif = Newsreader({ subsets: ["latin"], variable: "--font-serif" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#F7F4EE" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
