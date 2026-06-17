'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { ArrowRightLeft, RefreshCw, Sprout, Stethoscope, GraduationCap, Droplets } from 'lucide-react'
import { SectionDecor } from './decor/section-decor'
import { Reveal } from './decor/scroll-fx'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const PRESETS = [50, 100, 500, 1000]

// What a given number of PHP can fund on the ground (approximate costs).
const IMPACT_TIERS = [
  {
    icon: Droplets,
    php: 1500,
    label: 'One month of clean water for a family',
  },
  {
    icon: Sprout,
    php: 5000,
    label: 'A starter flock of laying hens + feed',
  },
  {
    icon: GraduationCap,
    php: 12000,
    label: 'A full year of school supplies for a child',
  },
  {
    icon: Stethoscope,
    php: 28000,
    label: 'Emergency medical care for a family',
  },
]

function fmtPhp(n: number) {
  return n.toLocaleString('en-PH', { maximumFractionDigits: 0 })
}

export function PhpImpact() {
  const { data, isLoading } = useSWR<{ rate: number; source: string }>(
    '/api/php-rate',
    fetcher,
    { revalidateOnFocus: false },
  )
  const [usd, setUsd] = useState(100)
  const rate = data?.rate ?? 58.5
  const php = usd * rate

  return (
    <section
      id="php"
      className="relative z-10 overflow-hidden py-24 sm:py-32"
      style={{
        background:
          'linear-gradient(180deg, var(--background), var(--section-tint), var(--background))',
      }}
    >
      <SectionDecor pattern="dots" variant="teal" seed={3} />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal/30 bg-card/40 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-teal-soft backdrop-blur-sm">
            Yield, amplified locally
          </p>
          <h2 className="text-balance font-heading text-3xl font-semibold sm:text-4xl md:text-5xl">
            Small yield, outsized impact
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            When donated yield is exchanged into Philippine pesos (PHP), it goes
            remarkably far. Local costs mean a modest amount of USDC yield funds
            real, life-changing work on the ground.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Converter */}
          <Reveal className="gradient-border p-px">
            <div className="flex h-full flex-col rounded-[calc(1rem-1px)] bg-card/80 p-6 backdrop-blur-sm sm:p-8">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  <ArrowRightLeft className="h-4 w-4 text-gold" aria-hidden="true" />
                  Live exchange rate
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  {isLoading ? (
                    <RefreshCw className="h-3 w-3 animate-spin" aria-hidden="true" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                  )}
                  {data?.source === 'estimate' ? 'estimate' : 'live'}
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-heading text-4xl font-semibold text-gold tabular-nums">
                  ₱{rate.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">/ 1 USDC</span>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="usd-amount"
                  className="text-xs uppercase tracking-wider text-muted-foreground"
                >
                  Yield amount (USDC)
                </label>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-3">
                  <span className="text-lg text-muted-foreground">$</span>
                  <input
                    id="usd-amount"
                    type="number"
                    min={1}
                    value={usd}
                    onChange={(e) =>
                      setUsd(Math.max(0, Number(e.target.value) || 0))
                    }
                    className="w-full bg-transparent text-lg font-semibold tabular-nums outline-none"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setUsd(p)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        usd === p
                          ? 'border-gold bg-primary/15 text-gold'
                          : 'border-border bg-background/40 text-muted-foreground hover:border-gold/40'
                      }`}
                    >
                      ${p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-teal/30 bg-teal/10 p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Becomes, on the ground
                </p>
                <p className="mt-1 font-heading text-3xl font-semibold text-teal-soft tabular-nums">
                  ₱{fmtPhp(php)}
                </p>
              </div>
            </div>
          </Reveal>

          {/* Impact examples */}
          <Reveal delay={120} className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              What ₱{fmtPhp(php)} can help fund:
            </p>
            {IMPACT_TIERS.map((tier) => {
              const reached = php / tier.php
              const can = reached >= 1
              return (
                <div
                  key={tier.label}
                  className={`flex items-center gap-4 rounded-2xl border p-5 backdrop-blur-sm transition-colors ${
                    can
                      ? 'border-gold/40 bg-card/70'
                      : 'border-border/40 bg-card/30'
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      can ? 'bg-primary/15 text-gold' : 'bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <tier.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{tier.label}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      ≈ ₱{fmtPhp(tier.php)} each
                    </p>
                  </div>
                  <span
                    className={`shrink-0 font-heading text-lg font-semibold tabular-nums ${
                      can ? 'text-gold' : 'text-muted-foreground'
                    }`}
                  >
                    {reached >= 1
                      ? `×${Math.floor(reached)}`
                      : `${Math.round(reached * 100)}%`}
                  </span>
                </div>
              )
            })}
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground/70">
              Figures are illustrative estimates based on typical local costs.
              As a non-profit, 100% of yield is converted and deployed to
              verified projects on the ground.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
