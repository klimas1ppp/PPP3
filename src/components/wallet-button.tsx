"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";

type WalletButtonProps = {
  variant?: "header" | "primary" | "icon";
  fullWidth?: boolean;
};

export function WalletButton({ variant = "header", fullWidth = false }: WalletButtonProps) {
  const { connector } = useAccount();
  const { disconnect } = useDisconnect();

  const handleDisconnect = () => {
    if (connector) disconnect({ connector });
  };

  const shell = fullWidth ? "w-full" : "";

  const btnIdle =
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border/60 bg-card/40 px-4 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:border-gold/50 hover:text-gold touch-manipulation";

  const btnPrimary =
    "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] touch-manipulation";

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        if (!mounted) {
          return (
            <div
              className={`h-11 rounded-xl border border-border/40 bg-card/20 ${
                variant === "icon"
                  ? "w-11"
                  : variant === "primary" || fullWidth
                    ? "w-full"
                    : "w-[8.5rem]"
              }`}
              aria-hidden
            />
          );
        }

        const connected = Boolean(account && chain);

        if (variant === "icon") {
          const iconBtn =
            "relative flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-card/40 text-foreground backdrop-blur-sm transition-colors hover:border-gold/50 hover:text-gold touch-manipulation";

          if (!connected || !account || !chain) {
            return (
              <button
                type="button"
                className={iconBtn}
                onClick={openConnectModal}
                aria-label="Connect wallet"
              >
                <Wallet className="h-5 w-5" aria-hidden />
              </button>
            );
          }

          if (chain.unsupported) {
            return (
              <button
                type="button"
                className={iconBtn}
                onClick={openChainModal}
                aria-label="Wrong network"
              >
                <Wallet className="h-5 w-5 text-gold" aria-hidden />
              </button>
            );
          }

          return (
            <button
              type="button"
              className={`${iconBtn} border-gold/40 text-gold`}
              onClick={openAccountModal}
              aria-label={`Wallet connected: ${account.displayName}`}
            >
              <Wallet className="h-5 w-5" aria-hidden />
              <span
                className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-gold"
                aria-hidden
              />
            </button>
          );
        }

        if (!connected) {
          return (
            <button
              type="button"
              className={`${variant === "primary" ? btnPrimary : btnIdle} ${shell}`}
              onClick={openConnectModal}
            >
              Connect Wallet
            </button>
          );
        }

        if (!account || !chain) {
          return (
            <button
              type="button"
              className={`${variant === "primary" ? btnPrimary : btnIdle} ${shell}`}
              onClick={openConnectModal}
            >
              Connect Wallet
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              type="button"
              className={`${variant === "primary" ? btnPrimary : btnIdle} ${shell}`}
              onClick={openChainModal}
            >
              Wrong network
            </button>
          );
        }

        if (variant === "primary") {
          return (
            <button
              type="button"
              className={`${btnPrimary} border border-gold/30 bg-primary/10 text-gold hover:scale-100`}
              onClick={openAccountModal}
            >
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
              {account.displayName}
            </button>
          );
        }

        return (
          <div
            className={`inline-flex h-11 items-stretch overflow-hidden rounded-xl border border-border/60 bg-card/40 text-sm backdrop-blur-sm ${shell}`}
          >
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center justify-center gap-2 px-3.5 font-medium text-foreground transition-colors hover:text-gold touch-manipulation"
              onClick={openAccountModal}
            >
              <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
              <span className="truncate">{account.displayName}</span>
            </button>
            <span className="w-px shrink-0 self-stretch bg-border/50" aria-hidden />
            <button
              type="button"
              className="shrink-0 px-3 text-xs text-muted-foreground transition-colors hover:text-gold touch-manipulation"
              onClick={handleDisconnect}
              aria-label="Disconnect wallet"
            >
              Disconnect
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
