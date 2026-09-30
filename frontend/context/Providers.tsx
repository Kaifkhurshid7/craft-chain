/**
 * Combined providers for all contexts
 * Wraps application with all necessary context providers
 */

"use client";

import React from "react";
import { WalletProvider } from "./WalletContext";
import { ContractProvider } from "./ContractContext";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Providers component that wraps all context providers
 * Should be used at the root of the application
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <WalletProvider>
      <ContractProvider>{children}</ContractProvider>
    </WalletProvider>
  );
}
