"use client";

import { useVault } from "@/hooks/use-vault";
import { shortAddr } from "@/lib/format";
import { VAULT } from "@/config";

export function WalletButton() {
  const vault = useVault();

  if (!vault.isConnected) {
    return (
      <button
        type="button"
        className="nav-wallet nav-wallet-connect"
        onClick={vault.connect}
        disabled={vault.isConnecting}
      >
        {vault.isConnecting ? "Connecting…" : "Connect Wallet"}
      </button>
    );
  }

  return (
    <div className="nav-wallet-group">
      {vault.isConnected && !vault.isOnBase && (
        <button
          type="button"
          className="nav-wallet nav-wallet-warn"
          onClick={vault.switchToBase}
          disabled={vault.isSwitching}
        >
          {vault.isSwitching ? "Switching…" : `Switch to ${VAULT.chainName}`}
        </button>
      )}
      <button
        type="button"
        className="nav-wallet nav-wallet-connected"
        onClick={() => vault.disconnect()}
        title="Click to disconnect"
      >
        <span className="wallet-dot" />
        {shortAddr(vault.address)}
      </button>
    </div>
  );
}
