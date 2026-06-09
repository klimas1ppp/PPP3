import type { Connector } from "wagmi";

function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** True when the page is opened inside a wallet's in-app browser (not mobile Safari/Chrome). */
function isWalletInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /MetaMaskMobile|Trust\/|CoinbaseWallet|Rainbow|StatusIm|TokenPocket/i.test(
    navigator.userAgent
  );
}

/** True when a real wallet provider is available (extension or in-app browser). */
export function hasUsableInjectedProvider(): boolean {
  if (typeof window === "undefined") return false;

  const eth = window.ethereum as
    | {
        request?: (args: { method: string }) => Promise<unknown>;
        isMetaMask?: boolean;
        isCoinbaseWallet?: boolean;
        isTrust?: boolean;
        isRabby?: boolean;
      }
    | undefined;

  if (!eth?.request) return false;

  if (eth.isMetaMask || eth.isCoinbaseWallet || eth.isTrust || eth.isRabby) {
    return true;
  }

  return !isMobileBrowser();
}

export function pickWalletConnector(
  connectors: readonly Connector[]
): Connector | undefined {
  const injected = connectors.find((c) => c.id === "injected");
  const walletConnect = connectors.find((c) => c.id === "walletConnect");

  // Mobile Safari/Chrome often exposes a broken injected provider — always use
  // WalletConnect unless we're already inside a wallet's in-app browser.
  if (isMobileBrowser() && !isWalletInAppBrowser()) {
    return walletConnect ?? injected ?? connectors[0];
  }

  if (hasUsableInjectedProvider() && injected) return injected;
  return walletConnect ?? injected ?? connectors[0];
}
