"use client";

import { VAULT } from "@/config";
import { liquidityRateToApy } from "@/lib/aave";
import { aavePoolAbi, vaultAbi, yieldVaultAbi } from "@/lib/abi";
import { useReadContract } from "wagmi";

export function useLendingApy() {
  const { data: yieldVaultAddr } = useReadContract({
    address: VAULT.address,
    abi: vaultAbi,
    functionName: "yieldVault",
    query: { refetchInterval: 60_000 },
  });

  const { data: lendingPoolAddr } = useReadContract({
    address: yieldVaultAddr,
    abi: yieldVaultAbi,
    functionName: "lendingPool",
    query: { enabled: Boolean(yieldVaultAddr), refetchInterval: 60_000 },
  });

  const { data: reserveData, isLoading } = useReadContract({
    address: lendingPoolAddr,
    abi: aavePoolAbi,
    functionName: "getReserveData",
    args: [VAULT.asset.address],
    query: { enabled: Boolean(lendingPoolAddr), refetchInterval: 60_000 },
  });

  const apy =
    reserveData?.currentLiquidityRate !== undefined
      ? liquidityRateToApy(BigInt(reserveData.currentLiquidityRate))
      : undefined;

  return {
    apy,
    isLoading: isLoading && apy === undefined,
  };
}
