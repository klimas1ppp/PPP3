import { createPublicClient, http, parseEther, type Address } from "viem";
import { base } from "viem/chains";
import { simulateContract } from "viem/actions";
import { VAULT } from "@/config";
import { erc20Abi, vaultAbi } from "@/lib/abi";
import type { WalletDepositProfile } from "@/lib/wallet-profile";

/** Rough minimum ETH on Base to cover at least one deposit tx. */
export const MIN_ETH_FOR_GAS = parseEther("0.00003");

const publicClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

export type DepositRoute = "usdc-batch" | "eth-batch" | "eth-sequential";

export function resolveDepositRoute(
  profile: WalletDepositProfile | null | undefined,
  payWithEth: boolean,
  useUsdcPath: boolean
): DepositRoute {
  if (useUsdcPath && profile?.supportsSendCalls) return "usdc-batch";
  if (profile?.supportsSendCalls) return "eth-batch";
  return "eth-sequential";
}

function humanizeSimError(err: unknown): string {
  const msg =
    (err as { shortMessage?: string })?.shortMessage ||
    (err as { message?: string })?.message ||
    String(err);
  const line = msg.split("\n")[0];

  if (/eth_simulateV1/i.test(line)) {
    return "Unable to simulate transaction. Please try again.";
  }
  if (/insufficient funds/i.test(line)) {
    return "Not enough ETH on Base for gas fees. Add a small amount of ETH, or use a wallet that supports paying gas in USDC.";
  }
  if (/exceeds balance|insufficient balance|transfer amount exceeds/i.test(line)) {
    return "Insufficient USDC balance.";
  }
  if (/allowance/i.test(line)) {
    return "USDC approval required — try again or use a smaller amount.";
  }
  if (/revert/i.test(line)) {
    const reason = line.match(/reverted with reason string '([^']+)'/)?.[1];
    if (reason) return reason;
  }
  return line.length > 140 ? `${line.slice(0, 137)}…` : line;
}

export function syncDepositBlocker({
  amount,
  walletBalance,
  ethBalance,
  route,
}: {
  amount: bigint;
  walletBalance: bigint;
  ethBalance: bigint;
  route: DepositRoute;
}): string | null {
  if (amount <= 0n) return null;
  if (amount > walletBalance) return "Insufficient USDC balance.";

  const needsEth = route === "eth-batch" || route === "eth-sequential";
  if (needsEth && ethBalance < MIN_ETH_FOR_GAS) {
    return "Not enough ETH on Base for gas. Add a small amount of ETH, or use a wallet that supports paying gas in USDC (e.g. Coinbase Wallet, Rabby).";
  }

  return null;
}

/** Simulate via eth_call — works on all standard Base RPC nodes. */
async function simulateDepositSteps(
  address: Address,
  amount: bigint,
  allowance: bigint
): Promise<void> {
  const needsApprove = allowance < amount;

  if (needsApprove) {
    await simulateContract(publicClient, {
      account: address,
      address: VAULT.asset.address,
      abi: erc20Abi,
      functionName: "approve",
      args: [VAULT.address, amount],
    });
    // Allowance is set in the batched/sequential approve tx before deposit runs.
    return;
  }

  await simulateContract(publicClient, {
    account: address,
    address: VAULT.address,
    abi: vaultAbi,
    functionName: "deposit",
    args: [amount, address],
  });
}

/** Simulate on-chain effects before opening the wallet. */
export async function preflightDeposit({
  address,
  amount,
  allowance,
  walletBalance,
  ethBalance,
  route,
}: {
  address: Address;
  amount: bigint;
  allowance: bigint;
  walletBalance: bigint;
  ethBalance: bigint;
  route: DepositRoute;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const sync = syncDepositBlocker({ amount, walletBalance, ethBalance, route });
  if (sync) return { ok: false, message: sync };

  try {
    await simulateDepositSteps(address, amount, allowance);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: humanizeSimError(e) };
  }
}
