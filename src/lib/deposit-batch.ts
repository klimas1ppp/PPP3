import {
  createWalletClient,
  custom,
  encodeFunctionData,
  type Address,
  type Hex,
} from "viem";
import { base } from "viem/chains";
import { eip5792Actions } from "viem/experimental";
import { VAULT } from "@/config";
import { erc20Abi, vaultAbi } from "@/lib/abi";
import { getWalletProvider, type WalletDepositProfile } from "@/lib/wallet-profile";

export type EncodedCall = { to: Address; value: Hex; data: Hex };

export async function createEip5792WalletClient(address: Address) {
  const provider = await getWalletProvider();
  return createWalletClient({
    account: address,
    chain: base,
    transport: custom(provider),
  }).extend(eip5792Actions());
}

function buildApproveCall(spender: Address, amount: bigint): EncodedCall {
  return {
    to: VAULT.asset.address,
    value: "0x0",
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, amount],
    }),
  };
}

function buildDepositCall(amount: bigint, receiver: Address): EncodedCall {
  return {
    to: VAULT.address,
    value: "0x0",
    data: encodeFunctionData({
      abi: vaultAbi,
      functionName: "deposit",
      args: [amount, receiver],
    }),
  };
}

/** Approve (exact amount) + deposit batched when allowance is insufficient. */
export function buildDepositBatchCalls({
  address,
  amount,
  allowance,
}: {
  address: Address;
  amount: bigint;
  allowance: bigint;
}): EncodedCall[] {
  const calls: EncodedCall[] = [];

  if (allowance < amount) {
    calls.push(buildApproveCall(VAULT.address, amount));
  }

  calls.push(buildDepositCall(amount, address));
  return calls;
}

type SendBatchResult = { batchId: string };

/** Batch via wallet_sendCalls — vault.deposit called directly, no middleware contracts. */
export async function sendDepositBatch({
  address,
  calls,
  profile,
  useUsdcGas,
}: {
  address: Address;
  calls: EncodedCall[];
  profile: WalletDepositProfile;
  useUsdcGas: boolean;
}): Promise<SendBatchResult> {
  const walletClient = await createEip5792WalletClient(address);

  const sendParams: Parameters<typeof walletClient.sendCalls>[0] = {
    account: address,
    calls: calls.map((c) => ({ to: c.to, value: 0n, data: c.data })),
    version: "1.0",
    forceAtomic: calls.length > 1 && profile.supportsAtomicBatch,
  };

  if (useUsdcGas) {
    (sendParams as { capabilities?: Record<string, unknown> }).capabilities = {
      paymasterService: {
        context: { erc20: VAULT.asset.address },
        optional: true,
      },
    };
  }

  const { id: batchId } = await walletClient.sendCalls(sendParams);
  if (!batchId) throw new Error("Wallet did not return a batch id");

  return { batchId };
}
