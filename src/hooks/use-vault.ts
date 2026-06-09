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
  buildDepositCalls,
  createEip5792WalletClient,
  sendDepositBatch,
} from "@/lib/deposit-batch";
import {
  writeApprove,
  writeDeposit,
  writeDepositWithPermit,
} from "@/lib/deposit-sequential";
import { confirmBatch, peekBatchTxHash, waitForTxHash } from "@/lib/confirm-tx";
import {
  preflightDeposit,
  resolveDepositRoute,
  syncDepositBlocker,
} from "@/lib/deposit-preflight";
import { humanizeError, toUnits } from "@/lib/format";
import {
  detectWalletProfile,
  depositGasHint,
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
    const injected = connectors.find((x) => x.id === "injected");
    const walletConnect = connectors.find((x) => x.id === "walletConnect");
    const hasInjected =
      typeof window !== "undefined" && typeof window.ethereum !== "undefined";
    const c =
      hasInjected && injected
        ? injected
        : (walletConnect ?? injected ?? connectors[0]);
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
  "address" | "allowance" | "deposited" | "walletBalance" | "ethBalance" | "refreshBalances" | "refetch"
>;

export function useDeposit(
  vault: VaultTxInput,
  profile: WalletDepositProfile | null,
  payWithEth: boolean
) {
  const [state, setState] = useState<ActionState>({ phase: "idle" });
  const { writeContractAsync } = useWriteContract();

  const useUsdcPath = prefersUsdcGas(profile, payWithEth);
  const depositRoute = resolveDepositRoute(profile, payWithEth, useUsdcPath);

  const submitDepositSequential = useCallback(
    async (amount: string) => {
      if (!vault.address) return;
      const wei = toUnits(amount, VAULT.asset.decimals);
      if (wei <= 0n) return;

      const gasPaidInUsdc = prefersUsdcGas(profile, payWithEth);
      setState({ phase: "signing", gasPaidInUsdc });

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
            // USDC-gas wallets need a single tx — don't split into approve + deposit
            if (gasPaidInUsdc) throw permitErr;

            setState({ phase: "signing", gasPaidInUsdc: false });
            const approveHash = await writeApprove(write, wei);
            setState({ phase: "pending", hash: approveHash, gasPaidInUsdc: false });
            await waitForTxHash(approveHash);
            await vault.refetch();
            setState({ phase: "signing", gasPaidInUsdc: false });
            hash = await writeDeposit(write, vault.address, wei);
          }
        }

        setState({ phase: "pending", hash, gasPaidInUsdc });
      } catch (e) {
        setState({ phase: "error", error: humanizeError(e) });
      }
    },
    [vault.address, vault.allowance, vault.refetch, profile, payWithEth, writeContractAsync]
  );

  const depositBatch = useCallback(
    async (amount: string, useUsdcGas: boolean) => {
      if (!vault.address || !profile) return;
      const wei = toUnits(amount, VAULT.asset.decimals);
      if (wei <= 0n) return;

      setState({ phase: "signing", gasPaidInUsdc: useUsdcGas });

      const walletClient = await createEip5792WalletClient(vault.address);
      const calls = await buildDepositCalls({
        walletClient,
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
        profile,
        useUsdcGas: useUsdcPath,
      });

      if (!preflight.ok) {
        setState({ phase: "error", error: preflight.message });
        return;
      }

      try {
        if (route === "usdc-batch") {
          await depositBatch(amount, true);
        } else {
          await submitDepositSequential(amount);
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
      submitDepositSequential,
    ]
  );

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
    setState({ phase: "idle" });
  }, []);
  const busy = state.phase !== "idle" && state.phase !== "success" && state.phase !== "error";

  return {
    state,
    deposit,
    reset,
    busy,
    willUseUsdcGas: useUsdcPath,
    gasHint: depositGasHint(profile, useUsdcPath),
    depositRoute,
    depositBlocker: (amount: string) => {
      const wei = toUnits(amount, VAULT.asset.decimals);
      return syncDepositBlocker({
        amount: wei,
        walletBalance: vault.walletBalance,
        ethBalance: vault.ethBalance,
        route: depositRoute,
        profile,
        useUsdcGas: useUsdcPath,
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
