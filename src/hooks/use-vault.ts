"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContracts,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { VAULT } from "@/config";
import { erc20Abi, vaultAbi } from "@/lib/abi";
import { humanizeError, toUnits } from "@/lib/format";

export type TxPhase =
  | "idle"
  | "approving"
  | "approve-confirming"
  | "signing"
  | "pending"
  | "success"
  | "error";

type ActionState = { phase: TxPhase; error?: string; hash?: `0x${string}` };

export function useVault() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending: isConnecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isOnBase = chainId === VAULT.chainId;

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { address: VAULT.address, abi: vaultAbi, functionName: "totalAssets" },
      ...(address
        ? [
            { address: VAULT.asset.address, abi: erc20Abi, functionName: "balanceOf", args: [address] },
            { address: VAULT.asset.address, abi: erc20Abi, functionName: "allowance", args: [address, VAULT.address] },
            { address: VAULT.address, abi: vaultAbi, functionName: "maxWithdraw", args: [address] },
          ]
        : []),
    ],
    query: { refetchInterval: address ? 15_000 : 30_000 },
  });

  const totalAssets = data?.[0]?.result as bigint | undefined;
  const walletBalance = (address ? data?.[1]?.result : 0n) as bigint;
  const allowance = (address ? data?.[2]?.result : 0n) as bigint;
  const deposited = (address ? data?.[3]?.result : 0n) as bigint;

  const connectWallet = useCallback(() => {
    const c = connectors.find((x) => x.id === "injected") ?? connectors[0];
    if (c) connect({ connector: c });
  }, [connect, connectors]);

  const switchToBase = useCallback(() => {
    switchChain({ chainId: VAULT.chainId });
  }, [switchChain]);

  return {
    address,
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

export function useDeposit(onDone?: () => void) {
  const vault = useVault();
  const [state, setState] = useState<ActionState>({ phase: "idle" });
  const { writeContractAsync } = useWriteContract();

  const refresh = useCallback(() => {
    void vault.refetch();
    onDone?.();
  }, [vault, onDone]);

  useTxConfirm(state, setState, refresh, "success");

  const needsApproval = useCallback(
    (amount: string) => {
      const wei = toUnits(amount, VAULT.asset.decimals);
      return wei > 0n && vault.allowance < wei;
    },
    [vault.allowance]
  );

  const approve = useCallback(
    async (amount: string) => {
      if (!vault.address) return;
      const wei = toUnits(amount, VAULT.asset.decimals);
      if (wei <= 0n) return;
      setState({ phase: "approving" });
      try {
        const hash = await writeContractAsync({
          address: VAULT.asset.address,
          abi: erc20Abi,
          functionName: "approve",
          args: [VAULT.address, wei],
        });
        setState({ phase: "approve-confirming", hash });
      } catch (e) {
        setState({ phase: "error", error: humanizeError(e) });
      }
    },
    [vault.address, writeContractAsync]
  );

  const deposit = useCallback(
    async (amount: string) => {
      if (!vault.address) return;
      const wei = toUnits(amount, VAULT.asset.decimals);
      if (wei <= 0n) return;
      setState({ phase: "signing" });
      try {
        const hash = await writeContractAsync({
          address: VAULT.address,
          abi: vaultAbi,
          functionName: "deposit",
          args: [wei, vault.address],
        });
        setState({ phase: "pending", hash });
      } catch (e) {
        setState({ phase: "error", error: humanizeError(e) });
      }
    },
    [vault.address, writeContractAsync]
  );

  const reset = useCallback(() => setState({ phase: "idle" }), []);
  const busy = state.phase !== "idle" && state.phase !== "success" && state.phase !== "error";

  return { state, needsApproval, approve, deposit, reset, busy };
}

export function useWithdraw(onDone?: () => void) {
  const vault = useVault();
  const [state, setState] = useState<ActionState>({ phase: "idle" });
  const { writeContractAsync } = useWriteContract();

  const refresh = useCallback(() => {
    void vault.refetch();
    onDone?.();
  }, [vault, onDone]);

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
