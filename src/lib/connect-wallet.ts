import { connect, disconnect, getAccount, reconnect } from "@wagmi/core";
import { getWagmiConfig, initAppKit } from "@/lib/wagmi-config";

export function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Page is opened inside a wallet's in-app browser (injected provider works). */
export function isWalletInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /MetaMaskMobile|Trust\/|CoinbaseWallet|Rainbow|StatusIm|TokenPocket/i.test(
    navigator.userAgent
  );
}

function hasInjectedProvider(): boolean {
  if (typeof window === "undefined") return false;
  const eth = window.ethereum as { request?: unknown } | undefined;
  return Boolean(eth?.request);
}

/** Opens the site in MetaMask's built-in browser — most reliable path on iOS. */
export function getMetaMaskDappLink(): string {
  const host = window.location.host;
  const path = window.location.pathname === "/" ? "" : window.location.pathname;
  return `https://metamask.app.link/dapp/${host}${path}`;
}

export function clearStaleWalletSessions(): void {
  if (typeof localStorage === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (
        key.startsWith("wc@2") ||
        key.startsWith("@w3m") ||
        key.startsWith("@appkit") ||
        key.startsWith("wagmi.") ||
        key.includes("walletconnect") ||
        key.includes("WALLETCONNECT")
      ) {
        keys.push(key);
      }
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // private browsing, etc.
  }
}

async function prepareConnection(): Promise<void> {
  const config = getWagmiConfig();
  const account = getAccount(config);
  if (account.isConnected && account.connector?.id === "walletConnect") {
    try {
      await disconnect(config);
    } catch {
      // stale session — continue
    }
  }
  clearStaleWalletSessions();
}

function findInjectedConnector() {
  const config = getWagmiConfig();
  return (
    config.connectors.find((c) => c.id === "injected") ??
    config.connectors.find((c) => c.id === "io.metamask") ??
    config.connectors.find((c) => c.type === "injected")
  );
}

async function connectInjected(): Promise<void> {
  const connector = findInjectedConnector();
  if (!connector) throw new Error("No browser wallet found");
  await connect(getWagmiConfig(), { connector });
}

/** Refresh wagmi after returning from a wallet app (required on iOS 17+). */
export async function refreshWalletSession(): Promise<void> {
  try {
    await reconnect(getWagmiConfig());
  } catch {
    // not connected yet
  }
}

export async function connectWallet(): Promise<void> {
  initAppKit();

  if (isWalletInAppBrowser() && hasInjectedProvider()) {
    await prepareConnection();
    await connectInjected();
    return;
  }

  await prepareConnection();

  const modal = initAppKit();
  if (!modal) return;
  await modal.open({ view: "Connect" });
}
