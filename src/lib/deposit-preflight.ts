import { createPublicClient, http, parseEther, type Address } from "viem";
import { base } from "viem/chains";
import { simulateContract } from "viem/actions";
import { VAULT } from "@/config";
import { vaultAbi } from "@/lib/abi";

/** Rough minimum ETH on Base to cover at least one deposit tx. */
export const MIN_ETH_FOR_GAS = parseEther("0.00003");

const publicClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

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
    return "Not enough ETH on Base for gas. Add a small amount of ETH to your wallet.";
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

/** Simulate via eth_call — works on all standard Base RPC nodes. */
async function simulateDepositSteps(
  address: Address,
  amount: bigint,
  allowance: bigint
): Promise<void> {
  const needsApprove = allowance < amount;

  if (needsApprove) {
    // depositWithPermit bundles permit + deposit — no separate approve tx to simulate.
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
}: {
  address: Address;
  amount: bigint;
  allowance: bigint;
  walletBalance: bigint;
  ethBalance: bigint;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (amount <= 0n) return { ok: false, message: "Enter an amount." };
  if (amount > walletBalance) return { ok: false, message: "Insufficient USDC balance." };
  if (ethBalance < MIN_ETH_FOR_GAS) {
    return { ok: false, message: "Not enough ETH on Base for gas. Add a small amount of ETH to your wallet." };
  }

  try {
    await simulateDepositSteps(address, amount, allowance);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: humanizeSimError(e) };
  }
}
