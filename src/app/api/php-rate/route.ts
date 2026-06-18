import { NextResponse } from "next/server";

export const revalidate = 3600;

type RateResult = {
  rate: number;
  source: string;
  updated: string | null;
};

async function fetchFrankfurter(): Promise<RateResult> {
  const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=PHP", {
    next: { revalidate: 3600 },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`frankfurter status ${res.status}`);
  const data = await res.json();
  const rate = data?.rates?.PHP;
  if (typeof rate !== "number") throw new Error("frankfurter: no PHP rate");
  return { rate, source: "frankfurter", updated: data?.date ?? null };
}

async function fetchErApi(): Promise<RateResult> {
  const res = await fetch("https://open.er-api.com/v6/latest/USD", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`er-api status ${res.status}`);
  const data = await res.json();
  const rate = data?.rates?.PHP;
  if (typeof rate !== "number") throw new Error("er-api: no PHP rate");
  return {
    rate,
    source: "exchangerate-api",
    updated: data?.time_last_update_utc ?? null,
  };
}

export async function GET() {
  const sources = [fetchFrankfurter, fetchErApi];

  for (const source of sources) {
    try {
      const result = await source();
      return NextResponse.json(result);
    } catch {
      // try next provider
    }
  }

  return NextResponse.json({ error: "PHP rate unavailable" }, { status: 503 });
}
