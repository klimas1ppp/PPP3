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
  if (!useUsdcPath) return "eth-sequential";
  // Rabby GasAccount + MetaMask gas-included: USDC gas on a single standard tx
  if (profile?.isRabby || profile?.isMetaMask) return "eth-sequential";
  // Smart-account wallets: EIP-5792 batch + wallet paymaster
  if (profile?.supportsSendCalls && profile?.supportsUsdcGas) return "usdc-batch";
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
    return "Not enough ETH on Base for gas. Add a small amount of ETH, or pay gas in USDC via your wallet if supported.";
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
  profile,
  useUsdcGas,
}: {
  amount: bigint;
  walletBalance: bigint;
  ethBalance: bigint;
  route: DepositRoute;
  profile?: WalletDepositProfile | null;
  useUsdcGas?: boolean;
}): string | null {
  if (amount <= 0n) return null;
  if (amount > walletBalance) return "Insufficient USDC balance.";

  const needsEth = route === "eth-sequential" && !useUsdcGas;
  if (needsEth && ethBalance < MIN_ETH_FOR_GAS) {
    return "Not enough ETH on Base for gas. Add a small amount of ETH, or pay gas in USDC via your wallet if supported.";
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
  route,
  profile,
  useUsdcGas,
}: {
  address: Address;
  amount: bigint;
  allowance: bigint;
  walletBalance: bigint;
  ethBalance: bigint;
  route: DepositRoute;
  profile?: WalletDepositProfile | null;
  useUsdcGas?: boolean;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const sync = syncDepositBlocker({
    amount,
    walletBalance,
    ethBalance,
    route,
    profile,
    useUsdcGas,
  });
  if (sync) return { ok: false, message: sync };

  try {
    await simulateDepositSteps(address, amount, allowance);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: humanizeSimError(e) };
  }
}
