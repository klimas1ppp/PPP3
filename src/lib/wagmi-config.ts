import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { base } from "wagmi/chains";
import { fallback, http } from "wagmi";
import { metaMaskDirectWallet } from "@/lib/metamask-direct-wallet";

export const APP_NAME = "PPP Charity Vault";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://ppp-pt.vercel.app";

export const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT ??
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
  "";

// Mobile app / extension — not Base Account (passkey popup opens browser tabs on mobile).
coinbaseWallet.preference = {
  options: "eoaOnly",
  telemetry: false,
};

export const BASE_RPC_URLS = ["https://mainnet.base.org", "https://base.llamarpc.com"];

const projectId = WALLET_CONNECT_PROJECT_ID || "ppp-charity-vault";

if (!WALLET_CONNECT_PROJECT_ID && typeof window !== "undefined") {
  console.warn(
    "[PPP] Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID for reliable WalletConnect / MetaMask mobile connections.",
  );
}

/** Standard RainbowKit config — best mobile deep-link + WalletConnect behavior. */
export const wagmiConfig = getDefaultConfig({
  appName: APP_NAME,
  appDescription: "Deposit USDC, keep your principal, donate the yield.",
  appUrl: APP_URL,
  appIcon: `${APP_URL}/favicon.svg`,
  projectId,
  chains: [base],
  wallets: [
    {
      groupName: "Popular",
      wallets: [metaMaskDirectWallet, coinbaseWallet, walletConnectWallet],
    },
  ],
  walletConnectParameters: {
    metadata: {
      name: APP_NAME,
      description: "Principal-preserving philanthropy on Base",
      url: APP_URL,
      icons: [`${APP_URL}/favicon.svg`],
    },
  },
  transports: {
    [base.id]: fallback(
      BASE_RPC_URLS.map((url, i) => http(url, { key: `base-${i}` })),
      { retryCount: 2 },
    ),
  },
  ssr: true,
});
