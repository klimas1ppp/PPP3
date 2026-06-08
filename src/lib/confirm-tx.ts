import { createPublicClient, http, type Address, type Hex } from "viem";
import { base } from "viem/chains";
import { createEip5792WalletClient } from "@/lib/deposit-batch";

export const publicClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

const POLL_MS = 2_000;
const TIMEOUT_MS = 120_000;

export function isTxHash(id: string): id is Hex {
  return /^0x[a-fA-F0-9]{64}$/.test(id);
}

export async function waitForTxHash(hash: Hex): Promise<Hex> {
  await publicClient.waitForTransactionReceipt({ hash, timeout: TIMEOUT_MS });
  return hash;
}

/** Confirm an EIP-5792 batch or a plain tx hash returned as the batch id. */
export async function confirmBatch(batchId: string, address: Address): Promise<Hex> {
  const walletClient = await createEip5792WalletClient(address);
  const deadline = Date.now() + TIMEOUT_MS;

  while (Date.now() < deadline) {
    try {
      const status = await walletClient.getCallsStatus({ id: batchId });
      const code = typeof status.status === "number" ? status.status : Number(status.status ?? 0);

      if (code >= 400) {
        throw new Error("Transaction failed on-chain.");
      }

      if (code >= 200) {
        const hash = status.receipts?.[status.receipts.length - 1]?.transactionHash;
        if (hash) {
          await publicClient.waitForTransactionReceipt({ hash, timeout: TIMEOUT_MS });
          return hash;
        }
      }
    } catch (e) {
      // MetaMask sometimes returns a tx hash as the batch id instead of supporting getCallsStatus
      if (isTxHash(batchId)) {
        await publicClient.waitForTransactionReceipt({ hash: batchId, timeout: TIMEOUT_MS });
        return batchId;
      }
      const msg = (e as Error).message ?? "";
      if (/does not exist|not available|unsupported|Unknown method/i.test(msg)) break;
    }

    await sleep(POLL_MS);
  }

  if (isTxHash(batchId)) {
    await publicClient.waitForTransactionReceipt({ hash: batchId, timeout: TIMEOUT_MS });
    return batchId;
  }

  throw new Error("Transaction confirmation timed out. Check the explorer link — if it succeeded, refresh the page.");
}

/** Best-effort tx hash right after wallet_sendCalls (for explorer link while confirming). */
export async function peekBatchTxHash(batchId: string, address: Address): Promise<Hex | undefined> {
  if (isTxHash(batchId)) return batchId;

  try {
    const walletClient = await createEip5792WalletClient(address);
    const status = await walletClient.getCallsStatus({ id: batchId });
    return status.receipts?.[status.receipts.length - 1]?.transactionHash;
  } catch {
    return undefined;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
