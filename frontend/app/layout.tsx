import type { Metadata } from "next";
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
  viewport: "width=device-width, initial-scale=1",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body className="bg-light text-dark">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
