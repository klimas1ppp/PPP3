import { createPublicClient, http, type Hex } from "viem";
import { base } from "viem/chains";

export const publicClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

const TIMEOUT_MS = 120_000;

export async function waitForTxHash(hash: Hex): Promise<Hex> {
  await publicClient.waitForTransactionReceipt({ hash, timeout: TIMEOUT_MS });
  return hash;
}
