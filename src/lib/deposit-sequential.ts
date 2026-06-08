import { createWalletClient, custom, type Address, type Hex } from "viem";
import { base } from "viem/chains";
import { VAULT } from "@/config";
import { erc20Abi, vaultAbi } from "@/lib/abi";
import { signUsdcPermit } from "@/lib/usdc-permit";
import { getWalletProvider } from "@/lib/wallet-profile";

export async function createDepositWalletClient(address: Address) {
  const provider = await getWalletProvider();
  return createWalletClient({
    account: address,
    chain: base,
    transport: custom(provider),
  });
}

type WriteContract = (params: {
  chainId: number;
  address: Address;
  abi: typeof vaultAbi | typeof erc20Abi;
  functionName: string;
  args: readonly unknown[];
}) => Promise<Hex>;

/** deposit() when allowance is sufficient. */
export async function writeDeposit(
  writeContract: WriteContract,
  address: Address,
  amount: bigint
): Promise<Hex> {
  return writeContract({
    chainId: VAULT.chainId,
    address: VAULT.address,
    abi: vaultAbi,
    functionName: "deposit",
    args: [amount, address],
  });
}

/** depositWithPermit() — one tx (permit + deposit). */
export async function writeDepositWithPermit(
  writeContract: WriteContract,
  address: Address,
  amount: bigint
): Promise<Hex> {
  const walletClient = await createDepositWalletClient(address);
  const sig = await signUsdcPermit(walletClient, address, VAULT.address, amount);
  return writeContract({
    chainId: VAULT.chainId,
    address: VAULT.address,
    abi: vaultAbi,
    functionName: "depositWithPermit",
    args: [amount, address, sig.deadline, sig.v, sig.r, sig.s],
  });
}

/** Classic approve + deposit — most compatible with standard MetaMask. */
export async function writeApprove(
  writeContract: WriteContract,
  amount: bigint
): Promise<Hex> {
  return writeContract({
    chainId: VAULT.chainId,
    address: VAULT.asset.address,
    abi: erc20Abi,
    functionName: "approve",
    args: [VAULT.address, amount],
  });
}
