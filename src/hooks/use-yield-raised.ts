"use client";

import { PRIOR_YIELD_DONATED_USD } from "@/config/prior-yield";
import { VAULT } from "@/config";
import { vaultAbi } from "@/lib/abi";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";

export function useYieldRaised() {
  const { data, isLoading } = useReadContract({
    address: VAULT.address,
    abi: vaultAbi,
    functionName: "totalYieldBalance",
    query: { refetchInterval: 30_000 },
  });

  const onChainUsd =
    data !== undefined ? Number(formatUnits(data, VAULT.asset.decimals)) : undefined;
  const raisedUsd =
    onChainUsd !== undefined ? onChainUsd + PRIOR_YIELD_DONATED_USD : undefined;

  return {
    raisedUsd,
    onChainUsd,
    priorUsd: PRIOR_YIELD_DONATED_USD,
    isLoading: isLoading && raisedUsd === undefined,
  };
}
