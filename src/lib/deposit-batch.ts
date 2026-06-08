import {
  createWalletClient,
  custom,
  encodeFunctionData,
  maxUint256,
  type Address,
  type Hex,
  type WalletClient,
} from "viem";
import { base } from "viem/chains";
import { eip5792Actions } from "viem/experimental";
import { VAULT } from "@/config";
import { erc20Abi, vaultAbi } from "@/lib/abi";
import { buildPermitCall, type EncodedCall } from "@/lib/usdc-permit";
import { getWalletProvider, type WalletDepositProfile } from "@/lib/wallet-profile";

export async function createEip5792WalletClient(address: Address) {
  const provider = await getWalletProvider();
  return createWalletClient({
    account: address,
    chain: base,
    transport: custom(provider),
  }).extend(eip5792Actions());
}

function buildApproveCall(spender: Address): EncodedCall {
  return {
    to: VAULT.asset.address,
    value: "0x0",
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, maxUint256],
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

export async function buildDepositBatchCalls({
  walletClient,
  address,
  amount,
  allowance,
  preferPermit,
}: {
  walletClient: WalletClient;
  address: Address;
  amount: bigint;
  allowance: bigint;
  preferPermit: boolean;
}): Promise<{ calls: EncodedCall[]; usedPermit: boolean }> {
  const calls: EncodedCall[] = [];
  let usedPermit = false;

  if (allowance < amount) {
    if (preferPermit) {
      try {
        calls.push(await buildPermitCall(walletClient, address, VAULT.address));
        usedPermit = true;
      } catch {
        calls.push(buildApproveCall(VAULT.address));
      }
    } else {
      calls.push(buildApproveCall(VAULT.address));
    }
  }

  calls.push(buildDepositCall(amount, address));
  return { calls, usedPermit };
}

type SendBatchResult = { batchId: string; txHash?: Hex };

/** Batch deposit via wallet_sendCalls — vault.deposit called directly, no middleware contracts. */
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
    // Wallet-native USDC gas — Base Account / Rabby pick their own paymaster; no app URL
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

export async function waitForBatch(batchId: string, address: Address): Promise<Hex | undefined> {
  const walletClient = await createEip5792WalletClient(address);
  const status = await walletClient.waitForCallsStatus({ id: batchId, timeout: 120_000 });

  const receipt = status.receipts?.[status.receipts.length - 1];
  return receipt?.transactionHash;
}
