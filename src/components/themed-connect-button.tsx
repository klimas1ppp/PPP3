"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

type ThemedConnectButtonProps = {
  variant?: "header" | "primary";
};

export function ThemedConnectButton({ variant = "header" }: ThemedConnectButtonProps) {
  const btnClass = variant === "header" ? "wallet-btn" : "btn-primary";
  const connectedClass =
    variant === "header" ? "wallet-btn wallet-btn-connected" : "btn-primary wallet-btn-connected";

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
            className={variant === "header" ? "wallet-btn-wrap" : "connect-nudge-actions"}
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
              <button type="button" className={connectedClass} onClick={openAccountModal}>
                <span className="wallet-dot" aria-hidden />
                {account.displayName}
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
