import type { Wallet } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConnector } from "wagmi";
import { injected } from "wagmi/connectors";

type MetaMaskWalletOptions = Parameters<typeof metaMaskWallet>[0];

type EthereumProvider = {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isRabby?: boolean;
  providers?: EthereumProvider[];
};

function isMobileUserAgent() {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** True when MetaMask is present — including multi-wallet `ethereum.providers`. */
function hasMetaMaskProvider(): boolean {
  if (typeof window === "undefined") return false;
  const eth = (window as Window & { ethereum?: EthereumProvider }).ethereum;
  if (!eth) return false;

  const isMetaMask = (provider: EthereumProvider) =>
    Boolean(provider.isMetaMask && !provider.isCoinbaseWallet && !provider.isRabby);

  if (eth.providers?.length) {
    return eth.providers.some(isMetaMask);
  }

  return isMetaMask(eth);
}

/**
 * RainbowKit's default metaMaskWallet only checks `window.ethereum` (often
 * Coinbase). When that fails it silently routes through a WC connector that
 * doesn't open MetaMask on click. This wallet uses wagmi's injected target
 * to reach the real MetaMask extension, and falls back to RainbowKit's
 * default path on mobile / when MetaMask isn't installed.
 */
export function metaMaskDirectWallet(options: MetaMaskWalletOptions): Wallet {
  const fallback = metaMaskWallet(options);

  return {
    ...fallback,
    installed:
      typeof window !== "undefined" && hasMetaMaskProvider()
        ? true
        : fallback.installed,
    createConnector: (walletDetails) => {
      const useInjected =
        typeof window !== "undefined" &&
        !isMobileUserAgent() &&
        hasMetaMaskProvider();

      if (useInjected) {
        return createConnector((config) => ({
          ...injected({ target: "metaMask" })(config),
          ...walletDetails,
        }));
      }

      return fallback.createConnector(walletDetails);
    },
  };
}
