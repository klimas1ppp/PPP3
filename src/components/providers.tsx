"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { WagmiProvider, type Config } from "wagmi";
import { createWagmiConfig } from "@/lib/wagmi-config";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null);

  // WalletConnect must init in the browser with the real page origin — building
  // the config during SSR leaves the modal stuck on "Connecting…" on mobile.
  useEffect(() => {
    setConfig(createWagmiConfig());
  }, []);

  if (!config) {
    return <div className="min-h-dvh" aria-busy="true" />;
  }

  return (
    <WagmiProvider config={config} reconnectOnMount>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
