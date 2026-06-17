'use client'

import { DollarSign, Users, Sprout, Percent } from 'lucide-react'
import { useLiveStats, GOAL_USD } from '@/lib/use-live-stats'
import { StatCard } from './stat-card'
import { DepositsFeed } from './deposits-feed'
import { TvlChart, AllocationChart } from './stats-charts'

function fmtUsd(n: number, frac = 0) {
  return `$${n.toLocaleString('en-US', {
    minimumFractionDigits: frac,
    maximumFractionDigits: frac,
  })}`
}

export function LiveStats() {
  const stats = useLiveStats()
  const goalPct = Math.min(100, (stats.tvl / GOAL_USD) * 100)

  return (
    <section
      id="stats"
      className="relative z-10 overflow-hidden py-24 sm:py-32"
      style={{
        background:
          'linear-gradient(180deg, var(--background), var(--section-tint), var(--background))',
      }}
    >
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div
        className="glow-teal pointer-events-none absolute right-0 top-1/4 h-96 w-96"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
            Real-time on-chain stats
          </p>
          <h2 className="mt-3 text-balance font-heading text-3xl font-semibold sm:text-4xl">
            Watch the seed grow, live
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Every deposit, every dollar of yield — transparent and updating in
            real time as the community grows.
          </p>
        </div>

        {/* Goal progress */}
        <div className="mt-14 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Raised toward goal</p>
              <p className="mt-1 font-heading text-3xl font-semibold tabular-nums sm:text-4xl">
                {fmtUsd(stats.tvl)}{' '}
                <span className="text-lg font-normal text-muted-foreground">
                  / {fmtUsd(GOAL_USD)}
                </span>
              </p>
            </div>
            <p className="font-heading text-2xl font-semibold text-gold tabular-nums">
              {goalPct.toFixed(1)}%
            </p>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-background/60">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
              style={{ width: `${goalPct}%` }}
            />
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={DollarSign}
            label="Total value locked"
            value={fmtUsd(stats.tvl)}
            sub="Principal preserved on Base"
            live
          />
          <StatCard
            icon={Users}
            label="Total depositors"
            value={stats.depositors.toLocaleString('en-US')}
            sub="Seeds planted by the community"
            live
          />
          <StatCard
            icon={Sprout}
            label="Yield donated"
            value={fmtUsd(stats.yieldGenerated, 2)}
            sub="100% to Philippines impact"
            live
          />
          <StatCard
            icon={Percent}
            label="Current APY"
            value={`${stats.apy.toFixed(2)}%`}
            sub="Blended lending yield"
            live
          />
        </div>

        {/* Charts + feed */}
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <TvlChart />
          <AllocationChart />
        </div>
        <div className="mt-6">
          <DepositsFeed deposits={stats.deposits} />
        </div>
      </div>
    </section>
  )
}
