'use client'

import { useEffect, useRef, useState } from 'react'

export const GOAL_USD = 2_000_000

export type Deposit = {
  id: string
  address: string
  amount: number
  timestamp: number
}

export type LiveStats = {
  tvl: number
  depositors: number
  yieldGenerated: number
  apy: number
  deposits: Deposit[]
}

const HEX = '0123456789abcdef'

// Fixed simulation epoch so the initial (server + first client) render is
// fully deterministic — this avoids hydration mismatches. Live values are
// only randomized after mount inside useEffect.
export const SIM_EPOCH = 1_717_200_000_000

// Deterministic PRNG (mulberry32) so seeded data matches on server & client.
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function addressFrom(rand: () => number) {
  let a = '0x'
  for (let i = 0; i < 40; i++) a += HEX[Math.floor(rand() * 16)]
  return a
}

const SEED_AMOUNTS = [
  250, 500, 1000, 1500, 2000, 3000, 5000, 7500, 10000, 12000, 15000, 25000,
  50000, 100, 750, 4200, 8800,
]

function amountFrom(rand: () => number) {
  const base = SEED_AMOUNTS[Math.floor(rand() * SEED_AMOUNTS.length)]
  const jitter = Math.round(base * (rand() * 0.4 - 0.2))
  return Math.max(50, base + jitter)
}

// Deterministic seed data, derived purely from a fixed seed + SIM_EPOCH.
function seedDeposits(count: number): Deposit[] {
  const rand = mulberry32(0x5eed)
  return Array.from({ length: count }).map((_, i) => {
    const ts = SIM_EPOCH - i * (90000 + Math.floor(rand() * 240000))
    return {
      id: `seed-${i}`,
      address: addressFrom(rand),
      amount: amountFrom(rand),
      timestamp: ts,
    }
  })
}

// Post-mount only — safe to use real randomness here.
function liveAddress() {
  let a = '0x'
  for (let i = 0; i < 40; i++) a += HEX[Math.floor(Math.random() * 16)]
  return a
}

function liveAmount() {
  const base = SEED_AMOUNTS[Math.floor(Math.random() * SEED_AMOUNTS.length)]
  const jitter = Math.round(base * (Math.random() * 0.4 - 0.2))
  return Math.max(50, base + jitter)
}

// Simulated on-chain statistics with periodic live updates.
export function useLiveStats(): LiveStats {
  const [stats, setStats] = useState<LiveStats>(() => ({
    tvl: 1_284_500,
    depositors: 3127,
    yieldGenerated: 142_380,
    apy: 6.4,
    deposits: seedDeposits(15),
  }))
  const yieldRef = useRef(stats.yieldGenerated)

  useEffect(() => {
    // Slow yield accrual ticker (every second)
    const yieldTimer = setInterval(() => {
      setStats((prev) => {
        const perSecond = (prev.tvl * (prev.apy / 100)) / (365 * 24 * 60 * 60)
        yieldRef.current += perSecond
        return { ...prev, yieldGenerated: prev.yieldGenerated + perSecond }
      })
    }, 1000)

    // New deposit events (every 4.5s)
    const depositTimer = setInterval(() => {
      setStats((prev) => {
        const newDeposit: Deposit = {
          id: `${Date.now()}-${Math.random()}`,
          address: liveAddress(),
          amount: liveAmount(),
          timestamp: Date.now(),
        }
        const apyDrift = Math.min(
          7.8,
          Math.max(5.2, prev.apy + (Math.random() * 0.2 - 0.1)),
        )
        return {
          ...prev,
          tvl: prev.tvl + newDeposit.amount,
          depositors: prev.depositors + 1,
          apy: Number(apyDrift.toFixed(2)),
          deposits: [newDeposit, ...prev.deposits].slice(0, 15),
        }
      })
    }, 4500)

    return () => {
      clearInterval(yieldTimer)
      clearInterval(depositTimer)
    }
  }, [])

  return stats
}

export const IMPACT_ALLOCATION = [
  { name: 'Farming & livestock', value: 24, fill: 'var(--color-chart-1)' },
  { name: 'Fishing equipment', value: 16, fill: 'var(--color-chart-2)' },
  { name: 'Medical bills', value: 14, fill: 'var(--color-chart-3)' },
  { name: 'Education', value: 13, fill: 'var(--color-chart-4)' },
  { name: 'Funding startups', value: 12, fill: 'var(--color-teal-soft)' },
  { name: 'Water systems', value: 9, fill: 'var(--color-chart-5)' },
  { name: 'Housing & infrastructure', value: 12, fill: 'var(--color-gold-soft)' },
]

// Weekly TVL history (in thousands of USDC) across the last ~8 months.
// label = short date; the range selector slices the tail of this series.
export const TVL_HISTORY = [
  { label: 'Jan', tvl: 120 },
  { label: 'Jan 15', tvl: 168 },
  { label: 'Feb', tvl: 260 },
  { label: 'Feb 15', tvl: 332 },
  { label: 'Mar', tvl: 410 },
  { label: 'Mar 15', tvl: 472 },
  { label: 'Apr', tvl: 540 },
  { label: 'Apr 15', tvl: 628 },
  { label: 'May', tvl: 720 },
  { label: 'May 15', tvl: 812 },
  { label: 'Jun', tvl: 910 },
  { label: 'Jun 15', tvl: 988 },
  { label: 'Jul', tvl: 1080 },
  { label: 'Jul 15', tvl: 1186 },
  { label: 'Aug', tvl: 1284 },
]

export const TVL_RANGES = [
  { key: '1M', points: 3 },
  { key: '3M', points: 7 },
  { key: '6M', points: 11 },
  { key: 'All', points: TVL_HISTORY.length },
] as const
