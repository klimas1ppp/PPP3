"use client";

import { getConnectorClient } from "@wagmi/core";
import type { Address, EIP1193Provider } from "viem";
import { VAULT } from "@/config";
import { wagmiConfig } from "@/components/providers";

const BASE_CHAIN_HEX = `0x${VAULT.chainId.toString(16)}` as const;

export type WalletDepositProfile = {
  isRabby: boolean;
  supportsSendCalls: boolean;
  supportsAtomicBatch: boolean;
  supportsUsdcGas: boolean;
};

type ChainCapabilities = {
  atomic?: { status?: string; supported?: boolean | string };
  paymasterService?: { supported?: boolean };
};

export async function getWalletProvider(): Promise<EIP1193Provider & { isRabby?: boolean }> {
  if (typeof window !== "undefined" && window.ethereum) {
    return window.ethereum;
  }
  const connectorClient = await getConnectorClient(wagmiConfig, { chainId: VAULT.chainId });
  const transport = connectorClient.transport as { value?: EIP1193Provider };
  if (transport.value) return transport.value as EIP1193Provider & { isRabby?: boolean };
  throw new Error("No wallet provider found");
}

function isAtomicSupported(caps?: ChainCapabilities): boolean {
  const atomic = caps?.atomic;
  return atomic?.status === "supported" || atomic?.supported === true || atomic?.supported === "supported";
}

export async function detectWalletProfile(address: Address): Promise<WalletDepositProfile> {
  let provider: EIP1193Provider & { isRabby?: boolean };
  try {
    provider = await getWalletProvider();
  } catch {
    return {
      isRabby: false,
      supportsSendCalls: false,
      supportsAtomicBatch: false,
      supportsUsdcGas: false,
    };
  }

  const isRabby = Boolean(provider.isRabby);

  try {
    const raw = (await provider.request({
      method: "wallet_getCapabilities",
      params: [address],
    })) as Record<string, ChainCapabilities>;

    const baseCaps = raw[BASE_CHAIN_HEX] ?? raw["0x2105"];
    const globalCaps = raw["0x0"];
    const paymasterSupported = Boolean(baseCaps?.paymasterService?.supported);

    return {
      isRabby,
      supportsSendCalls: true,
      supportsAtomicBatch: isAtomicSupported(baseCaps) || isAtomicSupported(globalCaps),
      // Rabby GasAccount + smart wallets advertising ERC-7677 paymaster on Base
      supportsUsdcGas: paymasterSupported || isRabby,
    };
  } catch {
    return {
      isRabby,
      supportsSendCalls: false,
      supportsAtomicBatch: false,
      supportsUsdcGas: isRabby,
    };
  }
}

export function prefersUsdcGas(
  profile: WalletDepositProfile | null | undefined,
  payWithEth: boolean
): boolean {
  if (payWithEth || !profile) return false;
  return profile.supportsUsdcGas && profile.supportsSendCalls;
}
