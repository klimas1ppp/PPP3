import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { base } from "@reown/appkit/networks";
import type { CustomRpcUrlMap } from "@reown/appkit-common";
import { createAppKit, type AppKit } from "@reown/appkit/react";
import type { Config } from "wagmi";

export const networks = [base] as [AppKitNetwork, ...AppKitNetwork[]];

const BASE_CAIP_ID = "eip155:8453" as const;

const customRpcUrls = {
  [BASE_CAIP_ID]: [{ url: "https://mainnet.base.org" }],
} satisfies CustomRpcUrlMap;

function getWalletConnectProjectId(): string {
  const id = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  if (!id) {
    throw new Error(
      "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Add it to .env.local or Vercel env vars."
    );
  }
  return id;
}

export const projectId = getWalletConnectProjectId();

/** Must match the domain allowlisted at https://dashboard.reown.com (no trailing slash). */
export function getAppOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  return fromEnv ?? "https://ppp-pt.vercel.app";
}

export function getAppMetadata(origin: string) {
  return {
    name: "PPP Charity Vault",
    description: "Deposit USDC, keep your principal, donate the yield.",
    url: origin,
    icons: [`${origin}/favicon.svg`],
  };
}

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  customRpcUrls,
});

export function getWagmiConfig(): Config {
  return wagmiAdapter.wagmiConfig;
}

let appKitModal: AppKit | undefined;

/** Registers the Reown modal — required for WalletConnect to open on mobile. */
export function initAppKit(): AppKit | undefined {
  if (typeof window === "undefined") return appKitModal;
  if (appKitModal) return appKitModal;

  const origin = getAppOrigin();
  appKitModal = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks,
    defaultNetwork: base,
    defaultAccountTypes: { eip155: "eoa" },
    metadata: getAppMetadata(origin),
    customRpcUrls,
    enableMobileFullScreen: true,
    enableReconnect: true,
    coinbasePreference: "eoaOnly",
    featuredWalletIds: [
      "1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369", // MetaMask
      "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", // Trust
      "fd20dc426fb37566d803205b19bbc1d4096b4acad050cbc27affaecb279329cf", // Coinbase
    ],
    features: {
      analytics: false,
      email: false,
      socials: false,
      swaps: false,
      onramp: false,
    },
  });

  return appKitModal;
}
