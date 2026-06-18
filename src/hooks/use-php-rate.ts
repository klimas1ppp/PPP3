"use client";

import useSWR from "swr";

type PhpRateResponse = {
  rate: number;
  source: string;
  updated: string | null;
};

async function fetchPhpRate(url: string): Promise<PhpRateResponse> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`rate fetch failed: ${res.status}`);
  return res.json() as Promise<PhpRateResponse>;
}

export function usePhpRate() {
  const { data, error, isLoading } = useSWR<PhpRateResponse>(
    "/api/php-rate",
    fetchPhpRate,
    { refreshInterval: 60_000, revalidateOnFocus: true },
  );

  return {
    rate: data?.rate,
    source: data?.source,
    updated: data?.updated,
    isLoading: isLoading && !data,
    isError: Boolean(error),
  };
}
