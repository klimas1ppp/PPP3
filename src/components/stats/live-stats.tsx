'use client'

import { DollarSign, Users, Sprout, Percent } from 'lucide-react'
import { useLendingApy } from '@/hooks/use-lending-apy'
import { useVaultTvl } from '@/hooks/use-vault-tvl'
import { useYieldRaised } from '@/hooks/use-yield-raised'
import { fmtUsd as formatVaultUsd } from '@/lib/format'
import { VAULT } from '@/config'
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
  const vaultTvl = useVaultTvl()
  const yieldRaised = useYieldRaised()
  const lendingApy = useLendingApy()
  const raisedUsd = yieldRaised.raisedUsd ?? 0
  const goalPct = Math.min(100, (raisedUsd / GOAL_USD) * 100)

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
                {yieldRaised.isLoading ? '…' : fmtUsd(raisedUsd, 2)}{' '}
                <span className="text-lg font-normal text-muted-foreground">
                  / {fmtUsd(GOAL_USD)}
                </span>
              </p>
            </div>
            <p className="font-heading text-2xl font-semibold text-gold tabular-nums">
              {yieldRaised.isLoading ? '…' : `${goalPct.toFixed(2)}%`}
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
            value={vaultTvl.isLoading ? '…' : formatVaultUsd(vaultTvl.totalAssets, VAULT.asset.decimals)}
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
            value={yieldRaised.isLoading ? '…' : fmtUsd(raisedUsd, 2)}
            sub="100% to Philippines impact"
            live
          />
          <StatCard
            icon={Percent}
            label="Current APY"
            value={lendingApy.isLoading ? '…' : `${lendingApy.apy?.toFixed(2) ?? '—'}%`}
            sub="Aave USDC supply rate"
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
