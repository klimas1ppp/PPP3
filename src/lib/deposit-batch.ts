import {
  createWalletClient,
  custom,
  encodeFunctionData,
  type Address,
  type Hex,
  type WalletClient,
} from "viem";
import { base } from "viem/chains";
import { eip5792Actions } from "viem/experimental";
import { VAULT } from "@/config";
import { vaultAbi } from "@/lib/abi";
import { signUsdcPermit, type PermitSig } from "@/lib/usdc-permit";
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

function buildDepositWithPermitCall(
  amount: bigint,
  receiver: Address,
  sig: PermitSig
): EncodedCall {
  return {
    to: VAULT.address,
    value: "0x0",
    data: encodeFunctionData({
      abi: vaultAbi,
      functionName: "depositWithPermit",
      args: [amount, receiver, sig.deadline, sig.v, sig.r, sig.s],
    }),
  };
}

/**
 * One vault call when possible: depositWithPermit (permit + deposit) or deposit().
 * Avoids approve+deposit split that breaks USDC-gas wallets on the second tx.
 */
export async function buildDepositCalls({
  walletClient,
  address,
  amount,
  allowance,
}: {
  walletClient: WalletClient;
  address: Address;
  amount: bigint;
  allowance: bigint;
}): Promise<EncodedCall[]> {
  if (allowance >= amount) {
    return [buildDepositCall(amount, address)];
  }

  const sig = await signUsdcPermit(walletClient, address, VAULT.address, amount);
  return [buildDepositWithPermitCall(amount, address, sig)];
}

type SendBatchResult = { batchId: string };

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
    chain: base,
    calls: calls.map((c) => ({ to: c.to, data: c.data })),
    experimental_fallback: true,
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
