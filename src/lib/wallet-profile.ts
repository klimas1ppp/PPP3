"use client";

import { getAccount, getConnectorClient } from "@wagmi/core";
import type { Address, EIP1193Provider } from "viem";
import { VAULT } from "@/config";
import { wagmiConfig } from "@/lib/wagmi-config";

const BASE_CHAIN_HEX = `0x${VAULT.chainId.toString(16)}` as const;

export type WalletDepositProfile = {
  isRabby: boolean;
  isMetaMask: boolean;
  supportsSendCalls: boolean;
  supportsAtomicBatch: boolean;
  supportsUsdcGas: boolean;
};

type ChainCapabilities = {
  atomic?: { status?: string; supported?: boolean | string };
  paymasterService?: { supported?: boolean };
};

export async function getWalletProvider(): Promise<EIP1193Provider & { isRabby?: boolean }> {
  try {
    const connectorClient = await getConnectorClient(wagmiConfig, {
      chainId: VAULT.chainId,
    });
    const transport = connectorClient.transport as { value?: EIP1193Provider };
    if (transport.value) return transport.value as EIP1193Provider & { isRabby?: boolean };
  } catch {
    // fall through to window.ethereum
  }
  if (typeof window !== "undefined" && window.ethereum) {
    return window.ethereum as EIP1193Provider & { isRabby?: boolean };
  }
  throw new Error("No wallet provider found");
}

function isAtomicSupported(caps?: ChainCapabilities): boolean {
  const atomic = caps?.atomic;
  return atomic?.status === "supported" || atomic?.supported === true || atomic?.supported === "supported";
}

function detectMetaMask(provider: EIP1193Provider & { isMetaMask?: boolean }): boolean {
  if (provider.isMetaMask && !(provider as { isRabby?: boolean }).isRabby) return true;

  const account = getAccount(wagmiConfig);
  const connectorId = account.connector?.id?.toLowerCase() ?? "";
  const connectorName = account.connector?.name?.toLowerCase() ?? "";
  if (connectorId.includes("metamask") || connectorName.includes("metamask")) return true;

  if (typeof window !== "undefined") {
    const eth = window.ethereum as {
      isMetaMask?: boolean;
      isRabby?: boolean;
      providers?: Array<{ isMetaMask?: boolean; isRabby?: boolean }>;
    };
    if (eth?.isMetaMask && !eth?.isRabby) return true;
    const mm = eth?.providers?.find((p) => p.isMetaMask && !p.isRabby);
    if (mm) return true;
  }

  return false;
}

function detectRabby(provider: EIP1193Provider & { isRabby?: boolean }): boolean {
  if (provider.isRabby) return true;

  const account = getAccount(wagmiConfig);
  const connectorId = account.connector?.id?.toLowerCase() ?? "";
  const connectorName = account.connector?.name?.toLowerCase() ?? "";
  if (connectorId.includes("rabby") || connectorName.includes("rabby")) return true;

  if (typeof window !== "undefined") {
    const eth = window.ethereum as {
      isRabby?: boolean;
      providers?: Array<{ isRabby?: boolean }>;
    };
    if (eth?.isRabby) return true;
    if (eth?.providers?.some((p) => p.isRabby)) return true;
  }

  return false;
}

export async function detectWalletProfile(address: Address): Promise<WalletDepositProfile> {
  let provider: EIP1193Provider & { isRabby?: boolean };
  try {
    provider = await getWalletProvider();
  } catch {
    return {
      isRabby: false,
      isMetaMask: false,
      supportsSendCalls: false,
      supportsAtomicBatch: false,
      supportsUsdcGas: false,
    };
  }

  const isRabby = detectRabby(provider);
  const isMetaMask = detectMetaMask(provider);

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
      isMetaMask,
      supportsSendCalls: true,
      supportsAtomicBatch: isAtomicSupported(baseCaps) || isAtomicSupported(globalCaps),
      // Rabby GasAccount + MetaMask gas-included txs on Base; smart accounts via paymaster
      supportsUsdcGas: paymasterSupported || isRabby || isMetaMask,
    };
  } catch {
    return {
      isRabby,
      isMetaMask,
      supportsSendCalls: false,
      supportsAtomicBatch: false,
      supportsUsdcGas: isRabby || isMetaMask,
    };
  }
}

/** Default to USDC gas when the wallet supports it (Rabby GasAccount, MetaMask on Base, paymaster). */
export function prefersUsdcGas(
  profile: WalletDepositProfile | null | undefined,
  payWithEth: boolean
): boolean {
  if (payWithEth || !profile) return false;
  return profile.supportsUsdcGas;
}

export function depositGasHint(
  profile: WalletDepositProfile | null | undefined,
  useUsdcPath: boolean
): string | null {
  if (!useUsdcPath || !profile) return null;
  if (profile.isRabby) return "Select GasAccount in Rabby to pay gas in USDC";
  if (profile.isMetaMask) return "Select USDC in MetaMask to pay the network fee";
  if (profile.supportsSendCalls && profile.supportsUsdcGas) return "Gas paid in USDC";
  return null;
}
