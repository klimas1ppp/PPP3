import { createConfig, http, injected, type Config } from "wagmi";
import { base } from "wagmi/chains";
import { walletConnect } from "wagmi/connectors";

function getWalletConnectProjectId(): string {
  const id = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  if (!id) {
    throw new Error(
      "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Add it to .env.local or Vercel env vars."
    );
  }
  return id;
}

/** Must match the domain allowlisted at https://dashboard.reown.com (no trailing slash). */
export function getAppOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "https://ppp-pt.vercel.app";
}

function walletConnectMetadata(origin: string) {
  return {
    name: "PPP Charity Vault",
    description: "Deposit USDC, keep your principal, donate the yield.",
    url: origin,
    icons: [`${origin}/favicon.svg`],
  };
}

let activeWagmiConfig: Config | undefined;

export function getWagmiConfig(): Config {
  if (!activeWagmiConfig) {
    throw new Error("Wagmi config is not ready — wait for client hydration.");
  }
  return activeWagmiConfig;
}

export function createWagmiConfig(): Config {
  const origin = getAppOrigin();
  const projectId = getWalletConnectProjectId();

  const config = createConfig({
    chains: [base],
    connectors: [
      injected(),
      walletConnect({
        projectId,
        showQrModal: true,
        metadata: walletConnectMetadata(origin),
      }),
    ],
    transports: {
      [base.id]: http("https://mainnet.base.org"),
    },
    ssr: true,
  });

  activeWagmiConfig = config;
  return config;
}
