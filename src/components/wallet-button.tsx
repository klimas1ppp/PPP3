"use client";

import { useVault } from "@/hooks/use-vault";
import { VAULT } from "@/config";

export function WalletButton() {
  const vault = useVault();

  if (vault.isConnected && vault.address) {
    return (
      <button
        type="button"
        className="wallet-btn wallet-btn-connected"
        onClick={() => vault.disconnect()}
        title="Disconnect"
      >
        <span className="wallet-dot" />
        {vault.address.slice(0, 6)}…{vault.address.slice(-4)}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="wallet-btn"
      onClick={vault.connect}
      disabled={vault.isConnecting}
    >
      {vault.isConnecting ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}

export function NetworkBanner() {
  const vault = useVault();
  if (!vault.isConnected || vault.isOnBase) return null;

  return (
    <div className="banner banner-warn network-banner">
      Wrong network.{" "}
      <button type="button" onClick={vault.switchToBase} className="banner-link">
        {vault.isSwitching ? "Switching…" : `Switch to ${VAULT.chainName}`}
      </button>
    </div>
  );
}
