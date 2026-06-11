"use client";

import { getConnectorClient } from "@wagmi/core";
import type { EIP1193Provider } from "viem";
import { VAULT } from "@/config";
import { wagmiConfig } from "@/lib/wagmi-config";

export async function getWalletProvider(): Promise<EIP1193Provider> {
  try {
    const connectorClient = await getConnectorClient(wagmiConfig, {
      chainId: VAULT.chainId,
    });
    const transport = connectorClient.transport as { value?: EIP1193Provider };
    if (transport.value) return transport.value;
  } catch {
    // fall through to window.ethereum
  }
  if (typeof window !== "undefined" && window.ethereum) {
    return window.ethereum as EIP1193Provider;
  }
  throw new Error("No wallet provider found");
}
