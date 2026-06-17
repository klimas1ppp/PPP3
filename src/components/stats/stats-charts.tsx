'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { IMPACT_ALLOCATION, TVL_HISTORY, TVL_RANGES } from '@/lib/use-live-stats'

// Recharts' ResponsiveContainer needs a measured DOM box; rendering it during
// SSR yields width/height of -1. Only mount charts on the client.
function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}

const tooltipStyle = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  color: 'var(--popover-foreground)',
  fontSize: '12px',
}

export function TvlChart() {
  const mounted = useMounted()
  const [range, setRange] = useState<(typeof TVL_RANGES)[number]['key']>('All')

  const data = useMemo(() => {
    const cfg = TVL_RANGES.find((r) => r.key === range) ?? TVL_RANGES[3]
    return TVL_HISTORY.slice(-cfg.points)
  }, [range])

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-semibold">TVL growth</h3>
          <p className="text-sm text-muted-foreground">
            Total value locked over time (in thousands of USDC)
          </p>
        </div>
        <div className="flex gap-1 rounded-full border border-border/60 bg-background/40 p-1">
          {TVL_RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                range === r.key
                  ? 'bg-primary/20 text-gold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={range === r.key}
            >
              {r.key}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 h-56 w-full">
        {mounted && (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -8, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="tvlFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-chart-1)"
                  stopOpacity={0.5}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-chart-1)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical
              horizontal
              stroke="var(--border)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
            <YAxis
              width={48}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickFormatter={(v: number) => `$${v}k`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [`$${Number(value)}k`, 'TVL']}
              cursor={{ stroke: 'var(--border)' }}
            />
            <Area
              type="monotone"
              dataKey="tvl"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              fill="url(#tvlFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export function AllocationChart() {
  const mounted = useMounted()
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm">
      <h3 className="font-heading text-lg font-semibold">Impact allocation</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        How 100% of the yield is put to work
      </p>
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="h-48 w-48 shrink-0">
          {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={IMPACT_ALLOCATION}
                dataKey="value"
                nameKey="name"
                innerRadius={48}
                outerRadius={80}
                paddingAngle={2}
                stroke="var(--background)"
                strokeWidth={2}
              >
                {IMPACT_ALLOCATION.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => [`${Number(value)}%`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          )}
        </div>
        <ul className="grid flex-1 grid-cols-1 gap-2">
          {IMPACT_ALLOCATION.map((item) => (
            <li
              key={item.name}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: item.fill }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </span>
              <span className="font-medium tabular-nums">{item.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
