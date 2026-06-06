"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http, injected } from "wagmi";
import { base } from "wagmi/chains";
import { walletConnect } from "wagmi/connectors";
import { VAULT } from "@/config";

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected(),
    walletConnect({ projectId: VAULT.walletConnectId, showQrModal: true }),
  ],
  transports: {
    [base.id]: http("https://mainnet.base.org"),
  },
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
