import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { coinbaseWallet } from "@rainbow-me/rainbowkit/wallets";
import { base } from "wagmi/chains";
import { fallback, http } from "wagmi";

const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT ??
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
  "";

coinbaseWallet.preference = {
  options: "all",
  telemetry: false,
};

const BASE_RPC_URLS = ["https://mainnet.base.org", "https://base.llamarpc.com"];

/** Hoisted outside components — avoids WalletConnect duplicate-init under StrictMode. */
export const wagmiConfig = getDefaultConfig({
  appName: "PPP Charity Vault",
  projectId: WALLET_CONNECT_PROJECT_ID || "ppp-charity-vault",
  chains: [base],
  transports: {
    [base.id]: fallback(
      BASE_RPC_URLS.map((url, i) => http(url, { key: `base-${i}` })),
      { retryCount: 2 }
    ),
  },
  ssr: true,
});
