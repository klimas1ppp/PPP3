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

export function getAppOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://ppp-pt.vercel.app";
}

function walletConnectMetadata(origin: string) {
  return {
    name: "PPP Charity Vault",
    description: "Deposit USDC, keep your principal, donate the yield.",
    url: origin,
    icons: [`${origin}/favicon.svg`],
  };
}

function buildWagmiConfig(): Config {
  const origin = getAppOrigin();
  const projectId = getWalletConnectProjectId();

  return createConfig({
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
}

let wagmiConfigSingleton: Config | undefined;

export function getWagmiConfig(): Config {
  if (!wagmiConfigSingleton) wagmiConfigSingleton = buildWagmiConfig();
  return wagmiConfigSingleton;
}
