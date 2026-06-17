import type { Wallet } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConnector } from "wagmi";
import { metaMask } from "wagmi/connectors";

const APP_NAME = "PPP Charity Vault";

type MetaMaskWalletOptions = Parameters<typeof metaMaskWallet>[0];

function getAppUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://ppp-pt.vercel.app";
}

/**
 * RainbowKit's default metaMaskWallet falls back to WalletConnect when another
 * extension (e.g. Coinbase Wallet) owns window.ethereum — which silently fails
 * without a valid Reown project ID. Always use the MetaMask SDK connector so
 * the browser extension is reached directly via EIP-6963 / SDK.
 */
export function metaMaskExtensionWallet(options: MetaMaskWalletOptions): Wallet {
  const wallet = metaMaskWallet(options);

  return {
    ...wallet,
    createConnector: (walletDetails) =>
      createConnector((config) => {
        const connector = metaMask({
          dappMetadata: {
            name: APP_NAME,
            url: getAppUrl(),
          },
          headless: true,
          checkInstallationImmediately: false,
          enableAnalytics: false,
        })(config);

        return { ...connector, ...walletDetails };
      }),
  };
}
