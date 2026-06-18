"use client";

import { VAULT } from "@/config";
import { vaultAbi } from "@/lib/abi";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";

export function useVaultTvl() {
  const { data, isLoading } = useReadContract({
    address: VAULT.address,
    abi: vaultAbi,
    functionName: "totalAssets",
    query: { refetchInterval: 30_000 },
  });

  const tvlUsd =
    data !== undefined ? Number(formatUnits(data, VAULT.asset.decimals)) : undefined;

  return {
    totalAssets: data,
    tvlUsd,
    isLoading: isLoading && tvlUsd === undefined,
  };
}
