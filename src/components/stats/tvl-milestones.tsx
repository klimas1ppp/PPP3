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
  Pause,
  RotateCcw,
  TrendingDown,
  ArrowLeftRight,
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
    color: 'oklch(0.78 0.12 175)',
    desc: 'The first proof that idle capital can generate continuous charitable funding without requiring donors to part with their principal.',
  },
  {
    threshold: 250_000,
    title: 'First Impact',
    annualYield: '~$7,500 annual yield',
    icon: HandHeart,
    color: '#58c9c8',
    desc: 'Enough to begin funding recurring assistance and small community initiatives in the Philippines.',
  },
  {
    threshold: 500_000,
    title: 'Recurring Support',
    annualYield: '~$15,000 annual yield',
    icon: Repeat,
    color: '#69d182',
    desc: 'PPP can consistently support families, educational needs, and local community projects throughout the year.',
  },
  {
    threshold: 1_000_000,
    title: 'Sustainable Programs',
    annualYield: '~$30,000 annual yield',
    icon: Building2,
    color: '#9cdc71',
    desc: 'The project reaches a scale where long-term programs become possible rather than one-time interventions.',
  },
  {
    threshold: 2_000_000,
    title: 'Community Transformation',
    annualYield: '~$60,000 annual yield',
    icon: Globe2,
    color: '#d1e262',
    desc: 'PPP can move beyond helping individual families and begin contributing to lasting improvements across entire communities through sustained funding and long-term initiatives.',
  },
]

/**
 * The TVL value range that a given progress-bar column fills across.
 *
 * There are 6 milestone columns but only 5 natural ranges between the
 * thresholds, so the large final $1M -> $2M range is split evenly across the
 * last two columns. This lets progress flow continuously from the very first
 * column to the last, with every column filling gradually (no permanently-full
 * origin column and no column that snaps straight to full).
 */
function segmentRange(i: number): { lo: number; hi: number } {
  const count = MILESTONES.length
  const finalLo = MILESTONES[count - 2].threshold
  const finalHi = MILESTONES[count - 1].threshold
  const finalMid = (finalLo + finalHi) / 2

  if (i === count - 2) return { lo: finalLo, hi: finalMid }
  if (i === count - 1) return { lo: finalMid, hi: finalHi }
  return { lo: MILESTONES[i].threshold, hi: MILESTONES[i + 1].threshold }
}

/** Unified accent used for every milestone icon, regardless of segment color. */
const ICON_COLOR = 'oklch(0.79 0.13 88)'

/** Particle field rendered over each reached/started segment (always present). */
const PARTICLES = [
  { left: 8, size: 5, delay: 0, drift: -4, tall: false },
  { left: 14, size: 3, delay: 0.5, drift: 3, tall: true },
  { left: 20, size: 6, delay: 1.1, drift: -3, tall: false },
  { left: 28, size: 3, delay: 1.8, drift: 5, tall: true },
  { left: 34, size: 7, delay: 0.3, drift: -2, tall: false },
  { left: 40, size: 4, delay: 2.1, drift: 4, tall: true },
  { left: 46, size: 5, delay: 0.9, drift: -5, tall: false },
  { left: 52, size: 3, delay: 1.4, drift: 3, tall: true },
  { left: 58, size: 6, delay: 0.2, drift: -3, tall: false },
  { left: 64, size: 4, delay: 1.7, drift: 5, tall: true },
  { left: 70, size: 7, delay: 0.7, drift: -4, tall: false },
  { left: 76, size: 3, delay: 2.3, drift: 2, tall: true },
  { left: 82, size: 5, delay: 1.0, drift: -2, tall: false },
  { left: 88, size: 4, delay: 0.4, drift: 4, tall: true },
  { left: 94, size: 6, delay: 1.5, drift: -3, tall: false },
] as const

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

  // Demo simulation: sweep TVL up (deposits) toward the goal, or down
  // (withdrawals) toward zero, so the orb can be verified moving both ways.
  const [simValue, setSimValue] = useState<number | null>(null)
  const [simRunning, setSimRunning] = useState(false)
  const [simDir, setSimDir] = useState<'up' | 'down'>('up')
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!simRunning) return
    const duration = 27360 // ms for full sweep (slowed a further 90% from 14400ms)
    const start = performance.now()
    const startValue = simValue ?? 0
    const target = simDir === 'down' ? 0 : finalGoalValue
    // Pace the sweep relative to the remaining fraction of the full range so
    // partial sweeps (e.g. after a pause or reverse) keep a consistent speed.
    const remaining = Math.abs(target - startValue) / finalGoalValue

    const tick = (now: number) => {
      const elapsed = now - start
      const linear = Math.min(1, elapsed / (duration * Math.max(remaining, 0.0001)))
      // ease-out so it slows as it approaches the target
      const eased = 1 - Math.pow(1 - linear, 2)
      const value = startValue + (target - startValue) * eased
      setSimValue(value)
      if (linear < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setSimValue(target)
        setSimRunning(false)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simRunning, simDir])

  const isSimulating = simValue !== null
  const tvl = isSimulating ? (simValue as number) : realTvl

  const startSimulation = () => {
    setSimDir('up')
    setSimValue(0)
    setSimRunning(true)
  }
  const startWithdrawal = () => {
    // Simulate withdrawals: begin fully funded and sweep down to zero.
    setSimDir('down')
    setSimValue(finalGoalValue)
    setSimRunning(true)
  }
  const reverseSimulation = () => {
    // Flip direction in place; the effect restarts from the current value.
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setSimDir((d) => (d === 'up' ? 'down' : 'up'))
    setSimRunning(true)
  }
  const stopSimulation = () => {
    // Pause in place: halt the animation but keep the current simulated value.
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setSimRunning(false)
  }
  const resumeSimulation = () => {
    // Continue the sweep from wherever it was paused.
    setSimRunning(true)
  }
  const resetSimulation = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setSimRunning(false)
    setSimValue(null)
    setSimDir('up')
  }

  // Paused = a simulation is active but not animating, and not yet parked at
  // the boundary for its current direction.
  const atBoundary =
    simDir === 'down'
      ? (simValue ?? 0) <= 0
      : (simValue ?? 0) >= finalGoalValue
  const isPaused = isSimulating && !simRunning && !atBoundary

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

  // The bar columns are equal-width but milestone thresholds are non-linear, so
  // the orb is positioned at the right edge of whichever segment is currently
  // filling (the "leading" column). This guarantees it always sits exactly at
  // the visual progress edge regardless of threshold spacing.
  let leadingIndex = -1
  let leadingFillRatio = 0
  for (let i = 0; i < MILESTONES.length; i++) {
    // Mirror the column fill logic so the orb sits exactly at the progress edge.
    const { lo, hi } = segmentRange(i)
    const fr = Math.max(0, Math.min(1, (tvl - lo) / (hi - lo)))
    if (fr > 0) {
      leadingIndex = i
      leadingFillRatio = fr
    }
  }

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
            <div className="flex items-center gap-2">
              {simRunning ? (
                <button
                  type="button"
                  onClick={stopSimulation}
                  className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-gold/20"
                >
                  <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                  Stop
                </button>
              ) : isPaused ? (
                <button
                  type="button"
                  onClick={resumeSimulation}
                  className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-gold/20"
                >
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  Resume
                </button>
              ) : null}
              <button
                type="button"
                onClick={reverseSimulation}
                className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-gold/20"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
                {simDir === 'up' ? 'Withdraw' : 'Deposit'}
              </button>
              <button
                type="button"
                onClick={resetSimulation}
                className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={startSimulation}
                className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-gold/20"
              >
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                Simulate growth
              </button>
              <button
                type="button"
                onClick={startWithdrawal}
                className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold"
              >
                <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                Simulate withdrawal
              </button>
            </div>
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
      <div className="relative mt-8">
        <div className="flex w-full items-stretch gap-0.5">
          {MILESTONES.map((m, i) => {
            const reached = tvl >= m.threshold
            const isActive = i === activeIndex
            const Icon = m.icon

            // Continuous left-to-right fill: each column covers a sub-range of
            // the $0 -> goal journey so progress visibly begins in the FIRST
            // column (instead of the Launch column being permanently full).
            // There are 6 columns but only 5 natural ranges, so the large final
            // $1M -> $2M range is split across the last two columns; this keeps
            // every bar filling gradually with no duplicated or snapping bar.
            const { lo, hi } = segmentRange(i)
            const fillRatio = Math.max(0, Math.min(1, (tvl - lo) / (hi - lo)))
            // Per-column color sequence: each column takes the color of the
            // next milestone; the final column is gold.
            const segColor = MILESTONES[i + 1]?.color ?? 'oklch(0.79 0.13 88)'
            const started = tvl > lo
            const segReached = tvl >= hi

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
              {/* Segment bar — non-clipped wrapper so particles can fly out the
                  top; the track/fill itself is clipped to the rounded shape. */}
              <div className="relative h-[1.875rem] w-full">
                <div className="absolute inset-0 overflow-hidden rounded-md bg-background/60 ring-1 ring-border/40">
                  <div
                    className="absolute inset-y-0 left-0 rounded-md transition-[width] duration-1000 ease-out"
                    style={{
                      width: `${fillRatio * 100}%`,
                      background: segColor,
                      opacity: started ? (segReached ? 1 : 0.95) : 0,
                    }}
                  />
                </div>

                {/* Always-present per-section particles: rise from the bottom of
                    the bar and float up above it. They are confined to the
                    FILLED portion of the segment, so a half-filled section only
                    emits particles from its left half. */}
                {started && (
                  <div
                    className="pointer-events-none absolute inset-0"
                    aria-hidden="true"
                  >
                    {PARTICLES.filter((pt) => pt.left / 100 <= fillRatio).map(
                      (pt, p) => (
                        <span
                          key={p}
                          className={cn(
                            'absolute bottom-0 rounded-full',
                            pt.tall ? 'animate-particle-tall' : 'animate-particle',
                          )}
                          style={{
                            left: `${pt.left}%`,
                            height: `${pt.size}px`,
                            width: `${pt.size}px`,
                            background: `color-mix(in oklch, ${segColor} 35%, white)`,
                            boxShadow: `0 0 6px color-mix(in oklch, ${segColor} 80%, transparent)`,
                            animationDelay: `${pt.delay}s`,
                            // @ts-expect-error custom property for horizontal drift
                            '--drift-x': `${pt.drift}px`,
                          }}
                        />
                      ),
                    )}
                  </div>
                )}

                {/* Single glow orb pinned to the leading edge of the filled
                    portion of the bar. It rests exactly at the current TVL
                    position, pulsing and glowing — it never disappears. */}
                {i === leadingIndex && (
                  <span
                    className="pointer-events-none absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-1000 ease-out"
                    style={{ left: `${leadingFillRatio * 100}%`, opacity: 1 }}
                    aria-hidden="true"
                  >
                    <span
                      className="animate-orb-pulse block h-10 w-10 rounded-full"
                      style={{
                        background:
                          'radial-gradient(circle, color-mix(in oklch, white 90%, transparent) 0%, color-mix(in oklch, var(--gold) 75%, transparent) 45%, transparent 72%)',
                        boxShadow:
                          '0 0 32px color-mix(in oklch, var(--gold) 85%, transparent)',
                      }}
                    />
                  </span>
                )}
              </div>

              {/* Icon centered under the segment — unified accent color */}
              <span className="relative flex items-center justify-center">
                {isActive && (
                  <span
                    className="animate-pulse-ring absolute h-7 w-7 rounded-full"
                    style={{ background: ICON_COLOR, opacity: 0.5 }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className="relative flex h-7 w-7 items-center justify-center rounded-full border transition-transform duration-200 group-hover:scale-110"
                  style={
                    reached
                      ? {
                          background: ICON_COLOR,
                          borderColor: ICON_COLOR,
                          color: 'var(--background)',
                          boxShadow: `0 0 12px color-mix(in oklch, ${ICON_COLOR} 65%, transparent)`,
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
    </div>
  )
}
