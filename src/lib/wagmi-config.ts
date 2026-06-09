import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { base } from "@reown/appkit/networks";
import { createAppKit, type AppKit } from "@reown/appkit/react";
import type { Config } from "wagmi";

export const networks = [base] as [AppKitNetwork, ...AppKitNetwork[]];

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
    metadata: getAppMetadata(origin),
    features: {
      analytics: false,
      email: false,
      socials: false,
    },
  });

  return appKitModal;
}

export function openConnectModal(): Promise<void> {
  const modal = initAppKit();
  if (!modal) return Promise.resolve();
  return modal.open({ view: "Connect" }).then(() => undefined);
}
