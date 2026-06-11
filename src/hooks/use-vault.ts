"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAccount,
  useBalance,
  useReadContracts,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { VAULT } from "@/config";
import { erc20Abi, vaultAbi } from "@/lib/abi";
import {
  writeApprove,
  writeDeposit,
  writeDepositWithPermit,
} from "@/lib/deposit-sequential";
import { waitForTxHash } from "@/lib/confirm-tx";
import { preflightDeposit, syncDepositBlocker } from "@/lib/deposit-preflight";
import { humanizeError, toUnits } from "@/lib/format";
import { getWalletProvider } from "@/lib/wallet-profile";
import { BASE_RPC_URLS } from "@/lib/wagmi-config";

export type VaultState = ReturnType<typeof useVault>;

const BASE_CHAIN_HEX = `0x${VAULT.chainId.toString(16)}` as const;

/** Re-read balances after tx — RPC can lag behind the receipt. */
async function refreshWithRetry(refetch: () => Promise<unknown>) {
  await refetch();
  window.setTimeout(() => void refetch(), 2_000);
  window.setTimeout(() => void refetch(), 5_000);
}

export type TxPhase =
  | "idle"
  | "signing"
  | "pending"
  | "success"
  | "error";

type ActionState = {
  phase: TxPhase;
  error?: string;
  hash?: `0x${string}`;
};

export function useVault() {
  const { address, isConnected: wagmiConnected, chainId, status } = useAccount();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();

  // Wallet extensions can briefly report disconnected while a tx is signing.
  const lastAddress = useRef<`0x${string}` | undefined>(undefined);
  useEffect(() => {
    if (address) lastAddress.current = address;
    if (status === "disconnected") lastAddress.current = undefined;
  }, [address, status]);

  const stableAddress =
    address ?? (status !== "disconnected" ? lastAddress.current : undefined);

  const isConnected =
    wagmiConnected ||
    status === "reconnecting" ||
    (status === "connecting" && Boolean(stableAddress));

  const isOnBase = chainId === VAULT.chainId;

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { address: VAULT.address, abi: vaultAbi, functionName: "totalAssets" },
      ...(stableAddress
        ? [
            { address: VAULT.asset.address, abi: erc20Abi, functionName: "balanceOf", args: [stableAddress] },
            { address: VAULT.asset.address, abi: erc20Abi, functionName: "allowance", args: [stableAddress, VAULT.address] },
            { address: VAULT.address, abi: vaultAbi, functionName: "maxWithdraw", args: [stableAddress] },
          ]
        : []),
    ],
    query: { refetchInterval: stableAddress ? 15_000 : 30_000 },
  });

  const totalAssets = data?.[0]?.result as bigint | undefined;
  const walletBalance = (stableAddress ? data?.[1]?.result : 0n) as bigint;
  const allowance = (stableAddress ? data?.[2]?.result : 0n) as bigint;
  const deposited = (stableAddress ? data?.[3]?.result : 0n) as bigint;

  const { data: ethBalData } = useBalance({
    address: stableAddress,
    chainId: VAULT.chainId,
  });
  const ethBalance = ethBalData?.value ?? 0n;

  const refreshBalances = useCallback(() => {
    void refreshWithRetry(refetch);
  }, [refetch]);

  const switchToBase = useCallback(async () => {
    try {
      await switchChainAsync({ chainId: VAULT.chainId });
      return;
    } catch {
      // wagmi switch can fail on mobile — fall through to direct provider request
    }

    const provider = await getWalletProvider();
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_CHAIN_HEX }],
      });
    } catch (e) {
      const code = (e as { code?: number })?.code;
      if (code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: BASE_CHAIN_HEX,
              chainName: VAULT.chainName,
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              rpcUrls: [...BASE_RPC_URLS],
              blockExplorerUrls: [VAULT.explorer],
            },
          ],
        });
        return;
      }
      throw e;
    }
  }, [switchChainAsync]);

  return {
    address: stableAddress,
    isConnected,
    isOnBase,
    isSwitching,
    switchToBase,
    totalAssets,
    walletBalance,
    allowance,
    deposited,
    ethBalance,
    isLoading,
    refetch,
    refreshBalances,
  };
}

function useTxConfirm(
  state: ActionState,
  setState: React.Dispatch<React.SetStateAction<ActionState>>,
  onConfirmed: () => void,
  successPhase: TxPhase = "success"
) {
  useEffect(() => {
    if (state.phase !== "pending" || !state.hash) return;

    let cancelled = false;
    void waitForTxHash(state.hash)
      .then(() => {
        if (cancelled) return;
        setState({ phase: successPhase, hash: state.hash });
        onConfirmed();
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            phase: "error",
            error: "Transaction confirmation timed out. Check the explorer — if it succeeded, refresh the page.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [state.hash, state.phase, setState, onConfirmed, successPhase]);
}

type VaultTxInput = Pick<
  VaultState,
  "address" | "allowance" | "deposited" | "walletBalance" | "ethBalance" | "refreshBalances" | "refetch"
>;

export function useDeposit(vault: VaultTxInput) {
  const [state, setState] = useState<ActionState>({ phase: "idle" });
  const { writeContractAsync } = useWriteContract();

  const deposit = useCallback(
    async (amount: string) => {
      if (!vault.address) return;
      const wei = toUnits(amount, VAULT.asset.decimals);
      if (wei <= 0n) return;

      const preflight = await preflightDeposit({
        address: vault.address,
        amount: wei,
        allowance: vault.allowance,
        walletBalance: vault.walletBalance,
        ethBalance: vault.ethBalance,
      });

      if (!preflight.ok) {
        setState({ phase: "error", error: preflight.message });
        return;
      }

      setState({ phase: "signing" });
      const write = writeContractAsync as Parameters<typeof writeDeposit>[0];

      try {
        let hash: `0x${string}`;

        if (vault.allowance >= wei) {
          hash = await writeDeposit(write, vault.address, wei);
        } else {
          try {
            hash = await writeDepositWithPermit(write, vault.address, wei);
          } catch (permitErr) {
            const msg = humanizeError(permitErr);
            if (/cancelled|rejected/i.test(msg)) throw permitErr;

            setState({ phase: "signing" });
            const approveHash = await writeApprove(write, wei);
            setState({ phase: "pending", hash: approveHash });
            await waitForTxHash(approveHash);
            await vault.refetch();
            setState({ phase: "signing" });
            hash = await writeDeposit(write, vault.address, wei);
          }
        }

        setState({ phase: "pending", hash });
      } catch (e) {
        setState({ phase: "error", error: humanizeError(e) });
      }
    },
    [vault.address, vault.allowance, vault.walletBalance, vault.ethBalance, vault.refetch, writeContractAsync]
  );

  useEffect(() => {
    if (state.phase !== "pending" || !state.hash) return;

    let cancelled = false;
    void waitForTxHash(state.hash)
      .then(() => {
        if (cancelled) return;
        setState((s) => ({ ...s, phase: "success" }));
        vault.refreshBalances();
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            phase: "error",
            error: "Transaction confirmation timed out. Check the explorer — if it succeeded, refresh the page.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [state.phase, state.hash, vault.refreshBalances]);

  const reset = useCallback(() => {
    setState({ phase: "idle" });
  }, []);
  const busy = state.phase !== "idle" && state.phase !== "success" && state.phase !== "error";

  return {
    state,
    deposit,
    reset,
    busy,
    depositBlocker: (amount: string) => {
      const wei = toUnits(amount, VAULT.asset.decimals);
      return syncDepositBlocker({
        amount: wei,
        walletBalance: vault.walletBalance,
        ethBalance: vault.ethBalance,
      });
    },
  };
}

export function useWithdraw(vault: VaultTxInput) {
  const [state, setState] = useState<ActionState>({ phase: "idle" });
  const { writeContractAsync } = useWriteContract();

  const refresh = useCallback(() => {
    vault.refreshBalances();
  }, [vault.refreshBalances]);

  useTxConfirm(state, setState, refresh, "success");

  const withdraw = useCallback(
    async (amount: string) => {
      if (!vault.address) return;
      const wei = toUnits(amount, VAULT.asset.decimals);
      if (wei <= 0n) return;
      const assets = wei > vault.deposited ? vault.deposited : wei;
      setState({ phase: "signing" });
      try {
        const hash = await writeContractAsync({
          address: VAULT.address,
          abi: vaultAbi,
          functionName: "withdraw",
          args: [assets, vault.address, vault.address],
        });
        setState({ phase: "pending", hash });
      } catch (e) {
        setState({ phase: "error", error: humanizeError(e) });
      }
    },
    [vault.address, vault.deposited, writeContractAsync]
  );

  const reset = useCallback(() => setState({ phase: "idle" }), []);
  const busy = state.phase !== "idle" && state.phase !== "success" && state.phase !== "error";

  return { state, withdraw, reset, busy };
}
