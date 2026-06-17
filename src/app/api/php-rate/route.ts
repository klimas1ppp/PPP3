import { NextResponse } from 'next/server'

// Cache the rate for an hour; revalidate in the background.
export const revalidate = 3600

const FALLBACK_RATE = 58.5

export async function GET() {
  try {
    const res = await fetch(
      'https://open.er-api.com/v6/latest/USD',
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()
    const rate = data?.rates?.PHP
    if (typeof rate !== 'number') throw new Error('no PHP rate')
    return NextResponse.json({ rate, source: 'live', updated: data.time_last_update_utc ?? null })
  } catch {
    return NextResponse.json({ rate: FALLBACK_RATE, source: 'estimate', updated: null })
  }
}
