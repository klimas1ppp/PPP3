import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  rabbyWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { base } from "wagmi/chains";
import { fallback, http } from "wagmi";

const APP_NAME = "PPP Charity Vault";

const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT ??
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
  "";

// Mobile app / extension — not Base Account (passkey popup opens browser tabs on mobile).
coinbaseWallet.preference = {
  options: "eoaOnly",
  telemetry: false,
};

export const BASE_RPC_URLS = ["https://mainnet.base.org", "https://base.llamarpc.com"];

/** Hoisted outside components — avoids WalletConnect duplicate-init under StrictMode. */
export const wagmiConfig = getDefaultConfig({
  appName: APP_NAME,
  projectId: WALLET_CONNECT_PROJECT_ID || "ppp-charity-vault",
  chains: [base],
  wallets: [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, walletConnectWallet, rabbyWallet, coinbaseWallet],
    },
  ],
  transports: {
    [base.id]: fallback(
      BASE_RPC_URLS.map((url, i) => http(url, { key: `base-${i}` })),
      { retryCount: 2 }
    ),
  },
  ssr: true,
});
