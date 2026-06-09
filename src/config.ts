/** Single source of truth — swap vault address when the real PPP vault ships. */
export const VAULT = {
  chainId: 8453,
  chainName: "Base",

  /** Aave USDC Base vault (ERC-4626) — placeholder until PPP vault is live */
  address: "0xa99ec0a1018bf964931c7dc421a5de8bca0e32f1" as const,

  asset: {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const,
    symbol: "USDC",
    decimals: 6,
  },

  charityName: "Principal Preserving Philanthropy",

  explorer: "https://basescan.org",
} as const;
