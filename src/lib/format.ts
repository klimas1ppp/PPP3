import { formatUnits, parseUnits } from "viem";

export function fmtAmount(raw: bigint | undefined, decimals: number, precision = 2) {
  if (raw === undefined) return "—";
  const n = Number(formatUnits(raw, decimals));
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0";
  return n.toLocaleString("en-US", { maximumFractionDigits: precision });
}

export function fmtUsd(raw: bigint | undefined, decimals: number) {
  if (raw === undefined) return "—";
  const n = Number(formatUnits(raw, decimals));
  if (!Number.isFinite(n)) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function shortAddr(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function sanitizeAmount(raw: string) {
  return raw
    .replace(/,/g, ".")
    .replace(/[^0-9.]/g, "")
    .replace(/^(\d*\.\d*)\..*/, "$1");
}

export function toUnits(value: string, decimals: number): bigint {
  if (!value) return 0n;
  try {
    const parsed = parseUnits(value as `${number}`, decimals);
    return parsed > 0n ? parsed : 0n;
  } catch {
    return 0n;
  }
}

export function trimUnits(raw: bigint, decimals: number) {
  const s = raw.toString().padStart(decimals + 1, "0");
  const whole = s.slice(0, s.length - decimals);
  const frac = s.slice(s.length - decimals).replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole;
}

export function humanizeError(err: unknown): string {
  const msg =
    (err as { shortMessage?: string })?.shortMessage ||
    (err as { message?: string })?.message ||
    "Transaction failed.";
  const first = msg.split("\n")[0];
  if (/user rejected|denied/i.test(first)) return "You cancelled the request.";
  if (/missing or invalid parameters/i.test(first)) {
    return "Wallet rejected the request. Try again.";
  }
  if (/gasaccount|gas account/i.test(first)) return "Transaction failed. Check your wallet and try again.";
  if (/insufficient funds/i.test(first)) return "Not enough ETH for gas.";
  if (/exceeds balance|insufficient/i.test(first)) return "Insufficient balance.";
  return first.length > 120 ? `${first.slice(0, 117)}…` : first;
}
