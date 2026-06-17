"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useConnections, useDisconnect } from "wagmi";

type ThemedConnectButtonProps = {
  variant?: "header" | "primary";
};

const headerClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border/60 bg-card/40 px-4 text-sm font-medium text-foreground transition-colors hover:border-gold/50 disabled:cursor-not-allowed disabled:opacity-50";

const primaryClass =
  "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50";

const connectedHeaderClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gold/30 bg-primary/10 px-4 text-sm font-medium text-gold transition-colors hover:border-gold/50";

const connectedPrimaryClass =
  "flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-gold/30 bg-primary/10 text-sm font-semibold text-gold transition-transform hover:scale-[1.01]";

const disconnectClass =
  "text-xs text-muted-foreground/70 underline-offset-2 transition-colors hover:text-gold hover:underline";

export function ThemedConnectButton({ variant = "header" }: ThemedConnectButtonProps) {
  const { disconnect } = useDisconnect();
  const { connector } = useAccount();
  const connections = useConnections();

  const handleDisconnect = () => {
    if (connector) {
      disconnect({ connector });
      return;
    }
    for (const connection of connections) {
      disconnect({ connector: connection.connector });
    }
  };

  const btnClass = variant === "header" ? headerClass : primaryClass;
  const connectedClass = variant === "header" ? connectedHeaderClass : connectedPrimaryClass;

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            className={variant === "header" ? "flex items-center gap-2" : undefined}
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {!connected ? (
              <button type="button" className={btnClass} onClick={openConnectModal}>
                Connect Wallet
              </button>
            ) : chain.unsupported ? (
              <button type="button" className={btnClass} onClick={openChainModal}>
                Wrong network
              </button>
            ) : (
              <>
                <button type="button" className={connectedClass} onClick={openAccountModal}>
                  <span className="inline-flex h-2 w-2 rounded-full bg-primary" aria-hidden />
                  {account.displayName}
                </button>
                {variant === "header" && (
                  <button
                    type="button"
                    className={disconnectClass}
                    onClick={handleDisconnect}
                    aria-label="Disconnect wallet"
                  >
                    Disconnect
                  </button>
                )}
              </>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
