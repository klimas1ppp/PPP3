import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  rabbyWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { base } from "wagmi/chains";
import { createConfig, fallback, http } from "wagmi";
import { metaMaskExtensionWallet } from "@/lib/metamask-extension-wallet";

export const APP_NAME = "PPP Charity Vault";

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

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskExtensionWallet,
        coinbaseWallet,
        walletConnectWallet,
        rabbyWallet,
      ],
    },
  ],
  {
    appName: APP_NAME,
    projectId,
  },
);

/** Hoisted outside components — avoids WalletConnect duplicate-init under StrictMode. */
export const wagmiConfig = createConfig({
  connectors,
  chains: [base],
  transports: {
    [base.id]: fallback(
      BASE_RPC_URLS.map((url, i) => http(url, { key: `base-${i}` })),
      { retryCount: 2 },
    ),
  },
  ssr: true,
});
