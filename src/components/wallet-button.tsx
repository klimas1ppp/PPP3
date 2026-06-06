"use client";

import { useVault } from "@/hooks/use-vault";

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
