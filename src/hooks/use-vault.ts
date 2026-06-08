"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useReadContracts,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { VAULT } from "@/config";
import { erc20Abi, vaultAbi } from "@/lib/abi";
import {
  buildDepositBatchCalls,
  sendDepositBatch,
} from "@/lib/deposit-batch";
import { confirmBatch, peekBatchTxHash, waitForTxHash } from "@/lib/confirm-tx";
import {
  preflightDeposit,
  resolveDepositRoute,
  syncDepositBlocker,
} from "@/lib/deposit-preflight";
import { humanizeError, toUnits } from "@/lib/format";
import {
  detectWalletProfile,
  prefersUsdcGas,
  type WalletDepositProfile,
} from "@/lib/wallet-profile";

export type VaultState = ReturnType<typeof useVault>;

/** Re-read balances after tx — RPC can lag behind the receipt. */
async function refreshWithRetry(refetch: () => Promise<unknown>) {
  await refetch();
  window.setTimeout(() => void refetch(), 2_000);
  window.setTimeout(() => void refetch(), 5_000);
}

export type TxPhase =
  | "idle"
  | "approving"
  | "approve-confirming"
  | "signing"
  | "pending"
  | "success"
  | "error";

type ActionState = {
  phase: TxPhase;
  error?: string;
  hash?: `0x${string}`;
  batchId?: string;
  gasPaidInUsdc?: boolean;
};

export function useWalletProfile(address: `0x${string}` | undefined, isConnected: boolean) {
  const [profile, setProfile] = useState<WalletDepositProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address || !isConnected) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void detectWalletProfile(address)
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [address, isConnected]);

  return { profile, loading };
}

export function useVault() {
  const { address, isConnected: wagmiConnected, chainId, status } = useAccount();
  const { connect, connectors, isPending: isConnecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

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

  const connectWallet = useCallback(() => {
    const c = connectors.find((x) => x.id === "injected") ?? connectors[0];
    if (c) connect({ connector: c });
  }, [connect, connectors]);

  const switchToBase = useCallback(() => {
    switchChain({ chainId: VAULT.chainId });
  }, [switchChain]);

  return {
    address: stableAddress,
    isConnected,
    isOnBase,
    isConnecting,
    isSwitching,
    connectError: connectError?.message ?? null,
    connect: connectWallet,
    disconnect,
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
    if (state.phase !== "approve-confirming" || !state.hash) return;

    let cancelled = false;
    void waitForTxHash(state.hash)
      .then(() => {
        if (cancelled) return;
        setState({ phase: "idle" });
        onConfirmed();
      })
      .catch(() => {
        if (!cancelled) setState({ phase: "error", error: "Approval confirmation timed out." });
      });

    return () => {
      cancelled = true;
    };
  }, [state.hash, state.phase, setState, onConfirmed]);

  useEffect(() => {
    if (state.phase !== "pending" || !state.hash || state.batchId) return;

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
  }, [state.hash, state.phase, state.batchId, setState, onConfirmed, successPhase]);
}

type VaultTxInput = Pick<
  VaultState,
  "address" | "allowance" | "deposited" | "walletBalance" | "ethBalance" | "refreshBalances"
>;

export function useDeposit(
  vault: VaultTxInput,
  profile: WalletDepositProfile | null,
  payWithEth: boolean
) {
  const [state, setState] = useState<ActionState>({ phase: "idle" });
  const pendingAmount = useRef<string | null>(null);
  const { writeContractAsync } = useWriteContract();

  const useUsdcPath = prefersUsdcGas(profile, payWithEth);
  const depositRoute = resolveDepositRoute(profile, payWithEth, useUsdcPath);

  const submitDepositEth = useCallback(
    async (amount: string) => {
      if (!vault.address) return;
      const wei = toUnits(amount, VAULT.asset.decimals);
      if (wei <= 0n) return;
      setState({ phase: "signing", gasPaidInUsdc: false });
      try {
        const hash = await writeContractAsync({
          address: VAULT.address,
          abi: vaultAbi,
          functionName: "deposit",
          args: [wei, vault.address],
        });
        setState({ phase: "pending", hash, gasPaidInUsdc: false });
      } catch (e) {
        setState({ phase: "error", error: humanizeError(e) });
      }
    },
    [vault.address, writeContractAsync]
  );

  const submitApproveEth = useCallback(
    async (amount: string) => {
      if (!vault.address) return;
      const wei = toUnits(amount, VAULT.asset.decimals);
      if (wei <= 0n) return;
      pendingAmount.current = amount;
      setState({ phase: "approving", gasPaidInUsdc: false });
      try {
        const hash = await writeContractAsync({
          address: VAULT.asset.address,
          abi: erc20Abi,
          functionName: "approve",
          args: [VAULT.address, wei],
        });
        setState({ phase: "approve-confirming", hash, gasPaidInUsdc: false });
      } catch (e) {
        pendingAmount.current = null;
        setState({ phase: "error", error: humanizeError(e) });
      }
    },
    [vault.address, writeContractAsync]
  );

  const depositBatch = useCallback(
    async (amount: string, useUsdcGas: boolean) => {
      if (!vault.address || !profile) return;
      const wei = toUnits(amount, VAULT.asset.decimals);
      if (wei <= 0n) return;

      const needsApprove = vault.allowance < wei;
      setState({
        phase: needsApprove ? "approving" : "signing",
        gasPaidInUsdc: useUsdcGas,
      });

      const calls = buildDepositBatchCalls({
        address: vault.address,
        amount: wei,
        allowance: vault.allowance,
      });

      const { batchId } = await sendDepositBatch({
        address: vault.address,
        calls,
        profile,
        useUsdcGas,
      });

      const peekHash = await peekBatchTxHash(batchId, vault.address);
      setState({ phase: "pending", batchId, hash: peekHash, gasPaidInUsdc: useUsdcGas });
    },
    [vault.address, vault.allowance, profile]
  );

  const depositEthSequential = useCallback(
    async (amount: string) => {
      if (!vault.address) return;
      const wei = toUnits(amount, VAULT.asset.decimals);
      if (wei <= 0n) return;
      if (vault.allowance < wei) {
        await submitApproveEth(amount);
      } else {
        await submitDepositEth(amount);
      }
    },
    [vault.address, vault.allowance, submitApproveEth, submitDepositEth]
  );

  const deposit = useCallback(
    async (amount: string) => {
      if (!vault.address) return;
      const wei = toUnits(amount, VAULT.asset.decimals);
      if (wei <= 0n) return;

      const route = resolveDepositRoute(profile, payWithEth, useUsdcPath);

      const preflight = await preflightDeposit({
        address: vault.address,
        amount: wei,
        allowance: vault.allowance,
        walletBalance: vault.walletBalance,
        ethBalance: vault.ethBalance,
        route,
      });

      if (!preflight.ok) {
        setState({ phase: "error", error: preflight.message });
        return;
      }

      try {
        if (route === "usdc-batch" || route === "eth-batch") {
          await depositBatch(amount, route === "usdc-batch");
        } else {
          await depositEthSequential(amount);
        }
      } catch (e) {
        setState({ phase: "error", error: humanizeError(e) });
      }
    },
    [
      vault.address,
      vault.allowance,
      vault.walletBalance,
      vault.ethBalance,
      profile,
      payWithEth,
      useUsdcPath,
      depositBatch,
      depositEthSequential,
    ]
  );

  useEffect(() => {
    if (state.phase !== "approve-confirming" || !state.hash) return;

    let cancelled = false;
    void waitForTxHash(state.hash)
      .then(() => {
        if (cancelled) return;
        const amount = pendingAmount.current;
        pendingAmount.current = null;
        vault.refreshBalances();
        if (amount) void submitDepositEth(amount);
        else setState({ phase: "idle" });
      })
      .catch(() => {
        if (!cancelled) setState({ phase: "error", error: "Approval confirmation timed out." });
      });

    return () => {
      cancelled = true;
    };
  }, [state.phase, state.hash, submitDepositEth, vault.refreshBalances]);

  useEffect(() => {
    if (state.phase !== "pending" || !state.batchId || !vault.address) return;

    let cancelled = false;
    void confirmBatch(state.batchId, vault.address)
      .then((hash) => {
        if (cancelled) return;
        setState((s) => ({ ...s, phase: "success", hash }));
        vault.refreshBalances();
      })
      .catch((e) => {
        if (!cancelled) setState({ phase: "error", error: humanizeError(e) });
      });

    return () => {
      cancelled = true;
    };
  }, [state.phase, state.batchId, vault.address, vault.refreshBalances]);

  useEffect(() => {
    if (state.phase !== "pending" || state.batchId || !state.hash) return;

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
  }, [state.phase, state.batchId, state.hash, vault.refreshBalances]);

  const reset = useCallback(() => {
    pendingAmount.current = null;
    setState({ phase: "idle" });
  }, []);
  const busy = state.phase !== "idle" && state.phase !== "success" && state.phase !== "error";

  return {
    state,
    deposit,
    reset,
    busy,
    willUseUsdcGas: useUsdcPath,
    depositRoute,
    depositBlocker: (amount: string) => {
      const wei = toUnits(amount, VAULT.asset.decimals);
      return syncDepositBlocker({
        amount: wei,
        walletBalance: vault.walletBalance,
        ethBalance: vault.ethBalance,
        route: depositRoute,
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
