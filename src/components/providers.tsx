"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { useTheme } from "next-themes";
import { useMemo, useState } from "react";
import { WagmiProvider } from "wagmi";
import { ThemeProvider } from "@/components/theme-provider";
import { WalletSessionGuard } from "@/components/wallet-session-guard";
import { getRainbowKitTheme } from "@/lib/rainbowkit-theme";
import { wagmiConfig } from "@/lib/wagmi-config";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function RainbowKitThemed({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const rainbowKitTheme = useMemo(
    () => getRainbowKitTheme(resolvedTheme === "dark" ? "dark" : "light"),
    [resolvedTheme],
  );

  return (
    <RainbowKitProvider theme={rainbowKitTheme}>
      <WalletSessionGuard />
      {children}
    </RainbowKitProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitThemed>{children}</RainbowKitThemed>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
