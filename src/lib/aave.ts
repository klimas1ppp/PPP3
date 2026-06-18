const RAY = 10n ** 27n;
const SECONDS_PER_YEAR = 31_536_000;

/** Aave v3 liquidity rate (RAY) → compounded supply APY (%). */
export function liquidityRateToApy(liquidityRate: bigint): number {
  const ratePerSecond = Number(liquidityRate) / Number(RAY) / SECONDS_PER_YEAR;
  return (Math.pow(1 + ratePerSecond, SECONDS_PER_YEAR) - 1) * 100;
}
