"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";

type WalletButtonProps = {
  variant?: "header" | "primary";
};

const disconnectClass =
  "touch-manipulation text-xs text-muted-foreground/70 underline-offset-2 transition-colors hover:text-gold hover:underline";

export function WalletButton({ variant = "header" }: WalletButtonProps) {
  const { isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();

  const handleDisconnect = () => {
    if (connector) disconnect({ connector });
  };

  return (
    <div
      className={
        variant === "primary"
          ? "wallet-connect-primary touch-manipulation"
          : "flex items-center gap-2 touch-manipulation"
      }
    >
      <ConnectButton
        showBalance={false}
        accountStatus="address"
        chainStatus={variant === "header" ? "icon" : "full"}
      />
      {variant === "header" && isConnected && (
        <button
          type="button"
          className={disconnectClass}
          onClick={handleDisconnect}
          aria-label="Disconnect wallet"
        >
          Disconnect
        </button>
      )}
    </div>
  );
}
