import {
  encodeFunctionData,
  hexToSignature,
  maxUint256,
  type Address,
  type Hex,
  type WalletClient,
} from "viem";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { VAULT } from "@/config";
import { erc20Abi } from "@/lib/abi";

const publicClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org"),
});

const PERMIT_TYPES = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

export type EncodedCall = { to: Address; value: Hex; data: Hex };

export async function buildPermitCall(
  walletClient: WalletClient,
  owner: Address,
  spender: Address
): Promise<EncodedCall> {
  const nonce = await publicClient.readContract({
    address: VAULT.asset.address,
    abi: erc20Abi,
    functionName: "nonces",
    args: [owner],
  });

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

  const signature = await walletClient.signTypedData({
    account: owner,
    domain: {
      name: "USD Coin",
      version: "2",
      chainId: VAULT.chainId,
      verifyingContract: VAULT.asset.address,
    },
    types: PERMIT_TYPES,
    primaryType: "Permit",
    message: {
      owner,
      spender,
      value: maxUint256,
      nonce,
      deadline,
    },
  });

  const { v, r, s } = hexToSignature(signature);

  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: "permit",
    args: [owner, spender, maxUint256, deadline, Number(v), r, s],
  });

  return {
    to: VAULT.asset.address,
    value: "0x0",
    data,
  };
}
