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
    color: 'var(--chart-4)',
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

/** Particle field rendered over each reached/started segment (always present). */
const PARTICLES = [
  { left: 12, size: 3, delay: 0, drift: -4, tall: false },
  { left: 24, size: 2, delay: 0.9, drift: 3, tall: true },
  { left: 36, size: 3, delay: 1.6, drift: -2, tall: false },
  { left: 48, size: 2, delay: 0.4, drift: 5, tall: true },
  { left: 58, size: 4, delay: 2.1, drift: -3, tall: false },
  { left: 68, size: 2, delay: 1.2, drift: 4, tall: true },
  { left: 80, size: 3, delay: 0.6, drift: -5, tall: false },
  { left: 90, size: 2, delay: 1.8, drift: 2, tall: true },
] as const

/** Extra burst emitted by a section while the orb is passing through it. */
const EXTRA_BURST = [
  { left: 8, size: 3, delay: 0, drift: -3, tall: true },
  { left: 18, size: 2, delay: 0.15, drift: 4, tall: false },
  { left: 30, size: 4, delay: 0.3, drift: -2, tall: true },
  { left: 42, size: 2, delay: 0.45, drift: 3, tall: false },
  { left: 54, size: 3, delay: 0.2, drift: -4, tall: true },
  { left: 64, size: 2, delay: 0.5, drift: 2, tall: false },
  { left: 74, size: 4, delay: 0.35, drift: -3, tall: true },
  { left: 84, size: 2, delay: 0.1, drift: 4, tall: false },
  { left: 94, size: 3, delay: 0.4, drift: -2, tall: true },
] as const

/** Dense particle trail dragged behind the moving glow orb. */
const ORB_TRAIL = [
  { dx: 2, size: 3, delay: 0, drift: 2, tall: false },
  { dx: -4, size: 2, delay: 0.25, drift: -3, tall: true },
  { dx: -9, size: 4, delay: 0.5, drift: 2, tall: false },
  { dx: -14, size: 2, delay: 0.75, drift: -2, tall: true },
  { dx: -19, size: 3, delay: 1.0, drift: 3, tall: false },
  { dx: -24, size: 2, delay: 1.25, drift: -4, tall: true },
  { dx: -29, size: 3, delay: 1.5, drift: 2, tall: false },
  { dx: -34, size: 2, delay: 1.75, drift: -2, tall: true },
  { dx: -6, size: 2, delay: 0.4, drift: 4, tall: true },
  { dx: -12, size: 3, delay: 0.65, drift: -3, tall: false },
  { dx: -18, size: 2, delay: 0.9, drift: 3, tall: true },
  { dx: -26, size: 2, delay: 1.15, drift: -2, tall: false },
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

  // Track which section the traveling glow orb is currently over so that
  // section can emit an extra particle burst as the orb passes through it.
  // The orb sweeps the reached portion (0 -> overallPct%) every 7s, matching
  // the `glow-travel` CSS animation period.
  const overallPctRef = useRef(overallPct)
  overallPctRef.current = overallPct
  const [orbSection, setOrbSection] = useState(-1)
  const orbSectionRef = useRef(-1)

  useEffect(() => {
    let raf = 0
    const period = 7000
    const segCount = MILESTONES.length
    const loop = (now: number) => {
      const phase = (now % period) / period
      const pos = (phase * overallPctRef.current) / 100 // 0..(overallPct/100)
      const sec = pos <= 0 ? -1 : Math.min(segCount - 1, Math.floor(pos * segCount))
      if (sec !== orbSectionRef.current) {
        orbSectionRef.current = sec
        setOrbSection(sec)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

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
      <div className="relative mt-8">
        <div className="flex w-full items-stretch gap-1.5">
          {MILESTONES.map((m, i) => {
            const reached = tvl >= m.threshold
            const isActive = i === activeIndex
            const Icon = m.icon
            const color = m.color ?? 'var(--gold)'

            // Each column shows the segment growing OUT of this milestone toward
            // the next one, so the very first segment (Launch -> First Yield)
            // begins filling immediately as TVL rises from $0. The final column
            // (no next milestone) acts as a "cap" that fills fully once its own
            // threshold (the goal) is reached, so it is never left colorless.
            const nextM = MILESTONES[i + 1]
            const isLast = !nextM
            const lo = m.threshold
            const hi = nextM ? nextM.threshold : m.threshold
            const fillRatio = isLast
              ? reached
                ? 1
                : 0
              : Math.max(0, Math.min(1, (tvl - lo) / (hi - lo)))
            // The final cap segment uses gold-soft; non-final segments take the
            // color of the milestone they lead into.
            const segColor = isLast ? 'var(--gold-soft)' : (nextM?.color ?? 'var(--gold)')
            const started = isLast ? reached : tvl > lo
            const segReached = isLast ? reached : tvl >= hi

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
                <div className="absolute inset-0 overflow-hidden rounded-full bg-background/60 ring-1 ring-border/40">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-1000 ease-out"
                    style={{
                      width: `${fillRatio * 100}%`,
                      background: segColor,
                      opacity: started ? (segReached ? 1 : 0.95) : 0,
                    }}
                  />
                </div>

                {/* Always-present per-section particles: rise from the bottom of
                    the bar and float up above it once the section is active. */}
                {started && (
                  <div
                    className="pointer-events-none absolute inset-0"
                    aria-hidden="true"
                  >
                    {PARTICLES.map((pt, p) => (
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
                    ))}
                  </div>
                )}

                {/* Temporary extra burst that fires while the traveling orb is
                    crossing THIS section. */}
                {started && orbSection === i && (
                  <div
                    className="pointer-events-none absolute inset-0"
                    aria-hidden="true"
                  >
                    {EXTRA_BURST.map((pt, p) => (
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
                          background: `color-mix(in oklch, ${segColor} 25%, white)`,
                          boxShadow: `0 0 8px color-mix(in oklch, ${segColor} 90%, transparent)`,
                          animationDelay: `${pt.delay}s`,
                          // @ts-expect-error custom property for horizontal drift
                          '--drift-x': `${pt.drift}px`,
                        }}
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

        {/* Single glow "comet" that travels left -> right across the reached
            portion of the bar, dragging a trail of particles with it. */}
        {overallPct > 0 && (
          <div
            className="pointer-events-none absolute left-0 top-0 h-[1.875rem]"
            style={{ width: `${overallPct}%` }}
            aria-hidden="true"
          >
            <span className="animate-glow-travel absolute top-1/2 -translate-x-1/2 -translate-y-1/2">
              {/* Core glow orb */}
              <span
                className="block h-6 w-6 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, color-mix(in oklch, white 85%, transparent) 0%, color-mix(in oklch, var(--gold) 70%, transparent) 45%, transparent 72%)',
                  boxShadow:
                    '0 0 22px color-mix(in oklch, var(--gold) 80%, transparent)',
                }}
              />
              {/* Dense particle trail dragged behind the moving glow */}
              {ORB_TRAIL.map((pt, p) => (
                <span
                  key={p}
                  className={cn(
                    'absolute left-1/2 top-1/2 rounded-full',
                    pt.tall ? 'animate-particle-tall' : 'animate-particle',
                  )}
                  style={{
                    height: `${pt.size}px`,
                    width: `${pt.size}px`,
                    marginLeft: `${pt.dx}px`,
                    background: 'color-mix(in oklch, var(--gold) 30%, white)',
                    boxShadow:
                      '0 0 6px color-mix(in oklch, var(--gold) 80%, transparent)',
                    animationDelay: `${pt.delay}s`,
                    // @ts-expect-error custom property for horizontal drift
                    '--drift-x': `${pt.drift}px`,
                  }}
                />
              ))}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
