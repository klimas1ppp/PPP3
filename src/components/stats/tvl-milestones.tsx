'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Rocket,
  Sprout,
  HandHeart,
  Repeat,
  Building2,
  Globe2,
  Play,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Milestone = {
  threshold: number
  title: string
  annualYield: string | null
  icon: LucideIcon
  desc: string
  /** color of the segment leading INTO this milestone (null for Launch) */
  color: string | null
}

const MILESTONES: Milestone[] = [
  {
    threshold: 0,
    title: 'Launch',
    annualYield: null,
    icon: Rocket,
    color: null,
    desc: 'PPP goes live and begins building a community of supporters committed to principal-preserving philanthropy.',
  },
  {
    threshold: 100_000,
    title: 'First Yield',
    annualYield: '~$3,000 annual yield',
    icon: Sprout,
    color: 'var(--teal)',
    desc: 'The first proof that idle capital can generate continuous charitable funding without requiring donors to part with their principal.',
  },
  {
    threshold: 250_000,
    title: 'First Impact',
    annualYield: '~$7,500 annual yield',
    icon: HandHeart,
    color: 'var(--chart-3)',
    desc: 'Enough to begin funding recurring assistance and small community initiatives in the Philippines.',
  },
  {
    threshold: 500_000,
    title: 'Recurring Support',
    annualYield: '~$15,000 annual yield',
    icon: Repeat,
    color: 'var(--chart-2)',
    desc: 'PPP can consistently support families, educational needs, and local community projects throughout the year.',
  },
  {
    threshold: 1_000_000,
    title: 'Sustainable Programs',
    annualYield: '~$30,000 annual yield',
    icon: Building2,
    color: 'var(--gold-soft)',
    desc: 'The project reaches a scale where long-term programs become possible rather than one-time interventions.',
  },
  {
    threshold: 2_000_000,
    title: 'Community Transformation',
    annualYield: '~$60,000 annual yield',
    icon: Globe2,
    color: 'var(--gold)',
    desc: 'PPP can move beyond helping individual families and begin contributing to lasting improvements across entire communities through sustained funding and long-term initiatives.',
  },
]

function fmtCompact(n: number) {
  if (n >= 1_000_000)
    return `$${(n / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${n}`
}

function fmtUsd(n: number) {
  return `$${n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

type Props = {
  tvlUsd?: number
  isLoading?: boolean
}

export function TvlMilestones({ tvlUsd, isLoading }: Props) {
  const realTvl = tvlUsd ?? 0
  const finalGoalValue = MILESTONES[MILESTONES.length - 1].threshold

  // Demo simulation: sweep TVL from 0 up to the final goal.
  const [simValue, setSimValue] = useState<number | null>(null)
  const [simRunning, setSimRunning] = useState(false)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!simRunning) return
    const duration = 9000 // ms for full sweep
    const start = performance.now()
    const startValue = simValue ?? 0
    const remaining = 1 - startValue / finalGoalValue

    const tick = (now: number) => {
      const elapsed = now - start
      // ease-out so it slows as it approaches the goal
      const linear = Math.min(1, elapsed / (duration * Math.max(remaining, 0.0001)))
      const eased = 1 - Math.pow(1 - linear, 2)
      const value = startValue + (finalGoalValue - startValue) * eased
      setSimValue(value)
      if (linear < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setSimValue(finalGoalValue)
        setSimRunning(false)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simRunning])

  const isSimulating = simValue !== null
  const tvl = isSimulating ? (simValue as number) : realTvl

  const startSimulation = () => {
    setSimValue(0)
    setSimRunning(true)
  }
  const resetSimulation = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setSimRunning(false)
    setSimValue(null)
  }

  // Highest milestone whose threshold has been reached.
  let activeIndex = 0
  for (let i = 0; i < MILESTONES.length; i++) {
    if (tvl >= MILESTONES[i].threshold) activeIndex = i
  }

  const [hovered, setHovered] = useState<number | null>(null)
  const display = hovered ?? activeIndex
  const shown = MILESTONES[display]
  const ShownIcon = shown.icon
  const next = MILESTONES[activeIndex + 1]

  // Overall progress toward the final milestone (for the headline %).
  const finalGoal = MILESTONES[MILESTONES.length - 1].threshold
  const overallPct = Math.min(100, (tvl / finalGoal) * 100)

  return (
    <div className="mt-14 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm sm:p-8">
      {/* Header: current TVL */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Total Value Locked
          </p>
          <p className="mt-1 font-heading text-3xl font-semibold tabular-nums sm:text-4xl">
            {isLoading ? '…' : fmtUsd(tvl)}
            <span className="text-lg font-normal text-muted-foreground">
              {' '}
              / {fmtCompact(finalGoal)}
            </span>
          </p>
        </div>
        <div className="flex items-end gap-4">
          <div className="text-right">
            <p className="font-heading text-2xl font-semibold text-gold tabular-nums">
              {isLoading && !isSimulating ? '…' : `${overallPct.toFixed(1)}%`}
            </p>
            {next ? (
              <p className="text-xs text-muted-foreground">
                Next: {next.title} at {fmtCompact(next.threshold)}
              </p>
            ) : (
              <p className="text-xs text-gold">All milestones reached</p>
            )}
          </div>
          {isSimulating ? (
            <button
              type="button"
              onClick={resetSimulation}
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset
            </button>
          ) : (
            <button
              type="button"
              onClick={startSimulation}
              className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-gold/20"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              Simulate growth
            </button>
          )}
        </div>
      </div>

      {/* Active / hovered milestone description */}
      <div
        key={display}
        className="hero-rise mt-6 flex items-start gap-3 rounded-xl border border-border/50 bg-background/40 p-4"
        style={{ animationDuration: '0.45s' }}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: `color-mix(in oklch, ${shown.color ?? 'var(--gold)'} 22%, transparent)`,
            color: shown.color ?? 'var(--gold)',
          }}
        >
          <ShownIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h3 className="font-heading text-lg font-semibold">{shown.title}</h3>
            <span className="text-sm font-medium tabular-nums text-muted-foreground">
              {fmtCompact(shown.threshold)} TVL
            </span>
            {shown.annualYield && (
              <span className="text-sm font-medium text-gold">
                {shown.annualYield}
              </span>
            )}
          </div>
          <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
            {shown.desc}
          </p>
        </div>
      </div>

      {/* Segmented milestone progress bar with icons centered beneath each segment */}
      <div className="mt-8 flex w-full items-stretch gap-1.5">
        {MILESTONES.map((m, i) => {
          const reached = tvl >= m.threshold
          const isActive = i === activeIndex
          const Icon = m.icon
          const color = m.color ?? 'var(--gold)'

          // Segment leading INTO this milestone (from the previous threshold).
          const prev = MILESTONES[i - 1]
          const hasSegment = i > 0 && Boolean(prev)
          const lo = prev?.threshold ?? 0
          const hi = m.threshold
          const fillRatio = hasSegment
            ? Math.max(0, Math.min(1, (tvl - lo) / (hi - lo)))
            : 0
          const started = hasSegment && tvl > lo

          return (
            <button
              key={m.title}
              type="button"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              onClick={() => setHovered(i)}
              aria-label={`${m.title} — ${fmtCompact(m.threshold)} TVL`}
              className="group flex flex-1 flex-col items-center gap-3 text-center focus:outline-none"
            >
              {/* Segment bar */}
              <div className="relative h-[1.875rem] w-full overflow-hidden rounded-full bg-background/60 ring-1 ring-border/40">
                {hasSegment && (
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-1000 ease-out"
                    style={{
                      width: `${fillRatio * 100}%`,
                      background: color,
                      boxShadow: started
                        ? `0 0 14px color-mix(in oklch, ${color} 70%, transparent)`
                        : 'none',
                      opacity: started ? (reached ? 1 : 0.95) : 0,
                    }}
                  >
                    {/* sliding sheen */}
                    {started && (
                      <span
                        className="animate-sheen absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg]"
                        style={{
                          background:
                            'linear-gradient(90deg, transparent, color-mix(in oklch, white 55%, transparent), transparent)',
                        }}
                        aria-hidden="true"
                      />
                    )}
                    {/* rising particles on reached segments */}
                    {reached &&
                      [20, 50, 80].map((leftPct, p) => (
                        <span
                          key={p}
                          className="animate-particle absolute bottom-0 h-1 w-1 rounded-full"
                          style={{
                            left: `${leftPct}%`,
                            background:
                              'color-mix(in oklch, white 70%, transparent)',
                            animationDelay: `${p * 0.7}s`,
                          }}
                          aria-hidden="true"
                        />
                      ))}
                  </div>
                )}
              </div>

              {/* Icon centered under the segment */}
              <span className="relative flex items-center justify-center">
                {isActive && (
                  <span
                    className="animate-pulse-ring absolute h-7 w-7 rounded-full"
                    style={{ background: color, opacity: 0.5 }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className="relative flex h-7 w-7 items-center justify-center rounded-full border transition-transform duration-200 group-hover:scale-110"
                  style={
                    reached
                      ? {
                          background: color,
                          borderColor: color,
                          color: 'var(--background)',
                          boxShadow: `0 0 12px color-mix(in oklch, ${color} 65%, transparent)`,
                        }
                      : {
                          background: 'var(--card)',
                          borderColor: 'var(--border)',
                          color: 'var(--muted-foreground)',
                        }
                  }
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </span>

              <span
                className={cn(
                  'text-[0.65rem] font-semibold tabular-nums sm:text-xs',
                  reached ? 'text-foreground' : 'text-muted-foreground/60',
                )}
              >
                {fmtCompact(m.threshold)}
              </span>
              <span
                className={cn(
                  'hidden max-w-[8rem] text-[0.7rem] leading-tight lg:block',
                  reached ? 'text-muted-foreground' : 'text-muted-foreground/50',
                  display === i && 'text-gold',
                )}
              >
                {m.title}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
