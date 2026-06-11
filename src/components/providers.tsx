"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { useEffect, useMemo, useState } from "react";
import { WagmiProvider } from "wagmi";
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

function useSiteTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const read = () => {
      const next = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      setTheme(next);
    };

    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const siteTheme = useSiteTheme();
  const rainbowKitTheme = useMemo(() => getRainbowKitTheme(siteTheme), [siteTheme]);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowKitTheme}>
          <WalletSessionGuard />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
