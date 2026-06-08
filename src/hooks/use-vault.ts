"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContracts,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { maxUint256 } from "viem";
import { VAULT } from "@/config";
import { erc20Abi, vaultAbi } from "@/lib/abi";
import {
  buildDepositBatchCalls,
  createEip5792WalletClient,
  sendDepositBatch,
  waitForBatch,
} from "@/lib/deposit-batch";
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
  | "permit-signing"
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
  const { isSuccess, isLoading } = useWaitForTransactionReceipt({ hash: state.hash });

  useEffect(() => {
    if (!state.hash || isLoading || !isSuccess) return;

    if (state.phase === "approve-confirming") {
      setState({ phase: "idle" });
      onConfirmed();
    } else if (state.phase === "pending") {
      setState({ phase: successPhase, hash: state.hash });
      onConfirmed();
    }
  }, [state.hash, state.phase, isLoading, isSuccess, setState, onConfirmed, successPhase]);
}

type VaultTxInput = Pick<VaultState, "address" | "allowance" | "deposited" | "refreshBalances">;

export function useDeposit(
  vault: VaultTxInput,
  profile: WalletDepositProfile | null,
  payWithEth: boolean
) {
  const [state, setState] = useState<ActionState>({ phase: "idle" });
  const pendingAmount = useRef<string | null>(null);
  const { writeContractAsync } = useWriteContract();
  const { isSuccess, isLoading } = useWaitForTransactionReceipt({ hash: state.hash });

  const useUsdcPath = prefersUsdcGas(profile, payWithEth);

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
      pendingAmount.current = amount;
      setState({ phase: "approving", gasPaidInUsdc: false });
      try {
        const hash = await writeContractAsync({
          address: VAULT.asset.address,
          abi: erc20Abi,
          functionName: "approve",
          args: [VAULT.address, maxUint256],
        });
        setState({ phase: "approve-confirming", hash, gasPaidInUsdc: false });
      } catch (e) {
        pendingAmount.current = null;
        setState({ phase: "error", error: humanizeError(e) });
      }
    },
    [vault.address, writeContractAsync]
  );

  const depositEth = useCallback(
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

  const depositUsdc = useCallback(
    async (amount: string) => {
      if (!vault.address || !profile) return;
      const wei = toUnits(amount, VAULT.asset.decimals);
      if (wei <= 0n) return;

      const needsAuth = vault.allowance < wei;
      if (needsAuth) setState({ phase: "permit-signing", gasPaidInUsdc: true });
      else setState({ phase: "signing", gasPaidInUsdc: true });

      try {
        const walletClient = await createEip5792WalletClient(vault.address);
        const { calls, usedPermit } = await buildDepositBatchCalls({
          walletClient,
          address: vault.address,
          amount: wei,
          allowance: vault.allowance,
          preferPermit: true,
        });

        if (usedPermit && needsAuth) setState({ phase: "signing", gasPaidInUsdc: true });

        const { batchId } = await sendDepositBatch({
          address: vault.address,
          calls,
          profile,
          useUsdcGas: true,
        });

        setState({ phase: "pending", batchId, gasPaidInUsdc: true });
        const txHash = await waitForBatch(batchId, vault.address);
        setState({
          phase: "success",
          hash: txHash,
          batchId,
          gasPaidInUsdc: true,
        });
        vault.refreshBalances();
      } catch (e) {
        // Wallet may not support batch/USDC gas — fall back to standard ETH txs
        if (!payWithEth) {
          try {
            await depositEth(amount);
            return;
          } catch {
            // keep original error if ETH path also fails
          }
        }
        setState({ phase: "error", error: humanizeError(e), gasPaidInUsdc: true });
      }
    },
    [vault.address, vault.allowance, vault.refreshBalances, profile, payWithEth, depositEth]
  );

  const deposit = useCallback(
    async (amount: string) => {
      if (useUsdcPath && profile) {
        await depositUsdc(amount);
      } else {
        await depositEth(amount);
      }
    },
    [useUsdcPath, profile, depositUsdc, depositEth]
  );

  useEffect(() => {
    if (!state.hash || isLoading || !isSuccess) return;

    if (state.phase === "approve-confirming") {
      const amount = pendingAmount.current;
      pendingAmount.current = null;
      vault.refreshBalances();
      if (amount) void submitDepositEth(amount);
      else setState({ phase: "idle" });
      return;
    }

    if (state.phase === "pending" && !state.batchId) {
      setState((s) => ({ ...s, phase: "success" }));
      vault.refreshBalances();
    }
  }, [state.hash, state.phase, state.batchId, isLoading, isSuccess, submitDepositEth, vault.refreshBalances]);

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
