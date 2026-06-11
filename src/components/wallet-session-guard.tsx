"use client";

import { useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";

/** Base Account (connector id `base`) opens browser tabs on mobile and loops on reconnect. */
const STALE_CONNECTOR_IDS = new Set(["base", "baseAccount"]);

export function WalletSessionGuard() {
  const { connector } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    const id = connector?.id;
    if (id && STALE_CONNECTOR_IDS.has(id)) {
      disconnect();
    }
  }, [connector?.id, disconnect]);

  return null;
}
