import { createPublicClient, http, parseUnits, type Address } from "viem";
import { base } from "viem/chains";
import { estimateContractGas, getGasPrice } from "viem/actions";
import { VAULT } from "@/config";
import { vaultAbi } from "@/lib/abi";

const publicClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

/** Chainlink ETH/USD on Base (8 decimals). */
const ETH_USD_FEED = "0x71041dddad3595F6CEd3Dc9Ce9a8d5817fda3e2A" as const;

const chainlinkAbi = [
  {
    type: "function",
    name: "latestRoundData",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" },
    ],
  },
] as const;

/** depositWithPermit is a single tx for MetaMask USDC gas — use when allowance is low. */
const PERMIT_GAS_FALLBACK = 380_000n;
const GAS_MULTIPLIER_NUM = 160n;
const GAS_MULTIPLIER_DEN = 100n;
const MIN_RESERVE = parseUnits("0.02", VAULT.asset.decimals);
const EXTRA_BUFFER = parseUnits("0.01", VAULT.asset.decimals);
const FALLBACK_ETH_USD = 3_000n * 10n ** 8n;

async function estimateDepositGasUnits(
  address: Address,
  amount: bigint,
  allowance: bigint
): Promise<bigint> {
  const sample = amount > 0n ? amount : parseUnits("1", VAULT.asset.decimals);

  if (allowance >= sample) {
    try {
      return await estimateContractGas(publicClient, {
        account: address,
        address: VAULT.address,
        abi: vaultAbi,
        functionName: "deposit",
        args: [sample, address],
      });
    } catch {
      return PERMIT_GAS_FALLBACK;
    }
  }

  return PERMIT_GAS_FALLBACK;
}

async function ethGasCostToUsdc(gasUnits: bigint): Promise<bigint> {
  const bufferedGas = (gasUnits * GAS_MULTIPLIER_NUM) / GAS_MULTIPLIER_DEN;
  const gasPrice = await getGasPrice(publicClient);
  const gasCostWei = bufferedGas * gasPrice;

  let ethUsd = FALLBACK_ETH_USD;
  try {
    const [, answer] = await publicClient.readContract({
      address: ETH_USD_FEED,
      abi: chainlinkAbi,
      functionName: "latestRoundData",
    });
    if (answer > 0n) ethUsd = answer;
  } catch {
    // use fallback price
  }

  const usdc = (gasCostWei * ethUsd) / 10n ** 20n;
  let reserve = usdc + EXTRA_BUFFER;
  if (reserve < MIN_RESERVE) reserve = MIN_RESERVE;
  return reserve;
}

/** USDC to keep in wallet for a deposit tx when gas is paid in USDC. */
export async function estimateUsdcGasReserve(
  address: Address,
  amount: bigint,
  allowance: bigint
): Promise<bigint> {
  const gasUnits = await estimateDepositGasUnits(address, amount, allowance);
  return ethGasCostToUsdc(gasUnits);
}

export function maxDepositWithUsdcGas(walletBalance: bigint, reserve: bigint): bigint {
  if (walletBalance <= reserve) return 0n;
  return walletBalance - reserve;
}
