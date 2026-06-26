'use client'

import Image from 'next/image'
import {
  Sprout,
  Fish,
  Stethoscope,
  GraduationCap,
  Droplets,
  Home,
  Rocket,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

const VIEW_W = 1000
const VIEW_H = 920

// Trunk anchor points (top = where branches sprout, base = where roots gather).
const TRUNK_TOP = { x: 500, y: 410 }
const TRUNK_BASE = { x: 500, y: 558 }
// A large planet only partly in view: its upper curvature rises up so it meets
// (and slightly overlaps) the spreading base of the tree's roots. Center is
// far below the canvas, so only the top cap shows.
const GLOBE = { x: 500, y: 1080, r: 560 }

type Cause = {
  icon: LucideIcon
  title: string
  body: string
  x: number
  y: number
  tone: 'gold' | 'teal'
}

// 8 causes arranged as a fanned canopy above the logo (left -> right).
const CAUSES: Cause[] = [
  {
    icon: Sprout,
    title: 'Farming & livestock',
    body: 'Seeds, tools, and animals so families can grow food and income year after year.',
    x: 132,
    y: 330,
    tone: 'gold',
  },
  {
    icon: Fish,
    title: 'Fishing equipment',
    body: 'Boats, nets, and gear that turn the sea into a renewable livelihood.',
    x: 238,
    y: 232,
    tone: 'teal',
  },
  {
    icon: Stethoscope,
    title: 'Medical bills',
    body: 'Covering urgent care and treatments that families cannot shoulder alone.',
    x: 362,
    y: 168,
    tone: 'gold',
  },
  {
    icon: GraduationCap,
    title: 'Education',
    body: 'Tuition, supplies, and scholarships that open doors for the next generation.',
    x: 430,
    y: 128,
    tone: 'teal',
  },
  {
    icon: Droplets,
    title: 'Water systems',
    body: 'Clean water infrastructure for healthier, more resilient communities.',
    x: 570,
    y: 128,
    tone: 'gold',
  },
  {
    icon: Home,
    title: 'Housing & infrastructure',
    body: 'Repairs and community structures that rebuild after storms and hardship.',
    x: 638,
    y: 168,
    tone: 'teal',
  },
  {
    icon: Rocket,
    title: 'Funding startups',
    body: 'Seed capital and mentorship for small local businesses that create jobs and keep income local.',
    x: 762,
    y: 232,
    tone: 'gold',
  },
  {
    icon: ShieldCheck,
    title: 'Natural disaster reserves',
    body: 'A dedicated reserve for rapid relief — food, shelter, and emergency aid when disasters strike.',
    x: 868,
    y: 330,
    tone: 'teal',
  },
]

// Points scattered across the VISIBLE land of the planet where capital
// originates ("across the world") — not lined up along the top arc, but spread
// over the surface so flows emerge from varied places. All lie inside the
// sphere (center 500,1080 r 560; visible cap top at y ≈ 520).
const GLOBE_SOURCES = [
  { x: 260, y: 690 },
  { x: 390, y: 648 },
  { x: 520, y: 706 },
  { x: 650, y: 656 },
  { x: 760, y: 700 },
  { x: 330, y: 742 },
  { x: 700, y: 744 },
]

function branchPath(p: { x: number; y: number }) {
  const cx = (TRUNK_TOP.x + p.x) / 2
  const cy = Math.min(TRUNK_TOP.y, p.y) - 46
  return `M ${TRUNK_TOP.x} ${TRUNK_TOP.y} Q ${cx} ${cy}, ${p.x} ${p.y}`
}

function rootPath(g: { x: number; y: number }) {
  const cx = (g.x + TRUNK_BASE.x) / 2
  const cy = (g.y + TRUNK_BASE.y) / 2 + 10
  return `M ${g.x} ${g.y} Q ${cx} ${cy}, ${TRUNK_BASE.x} ${TRUNK_BASE.y}`
}

function Particle({
  d,
  dur,
  begin,
  r = 3.4,
}: {
  d: string
  dur: number
  begin: number
  r?: number
}) {
  return (
    <circle r={r} fill="url(#tree-gold)" filter="url(#tree-pglow)">
      <animateMotion
        dur={`${dur}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
        path={d}
        rotate="auto"
      />
      <animate
        attributeName="opacity"
        values="0;1;1;0"
        keyTimes="0;0.12;0.82;1"
        dur={`${dur}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
      />
    </circle>
  )
}

export function ImpactTree() {
  return (
    <div className="mt-12">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
          Where the yield flows
        </p>
        <h3 className="mt-3 text-balance font-heading text-2xl font-semibold sm:text-3xl">
          One tree, rooted in the world — branching into real impact
        </h3>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
          Capital flows in from across the globe, takes root, and the yield it
          grows branches out to the causes below. Hover a leaf to see how each
          one helps.
        </p>
      </div>

      <div className="relative mx-auto mt-8 w-full max-w-4xl [container-type:inline-size]">
        <div
          className="relative w-full"
          style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="tree-gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--gold-soft)" />
                <stop offset="100%" stopColor="var(--gold)" />
              </linearGradient>
              {/* Top-bright gradient for the partial planet: the visible upper
                  arc glows teal and fades into the background lower down. */}
              <linearGradient id="tree-globe" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.5" />
                <stop offset="12%" stopColor="var(--teal)" stopOpacity="0.28" />
                <stop offset="30%" stopColor="var(--teal)" stopOpacity="0.08" />
                <stop offset="55%" stopColor="var(--background)" stopOpacity="0" />
              </linearGradient>
              <radialGradient id="tree-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
              </radialGradient>
              <filter id="tree-pglow" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="2.4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="tree-soft" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
              <clipPath id="tree-globe-clip">
                <circle cx={GLOBE.x} cy={GLOBE.y} r={GLOBE.r} />
              </clipPath>
            </defs>

            {/* soft halo behind the logo */}
            <circle cx={500} cy={462} r={170} fill="url(#tree-halo)" />

            {/* ---- GLOBE at the roots (large planet, only partly in view) ---- */}
            <g>
              {/* sphere body */}
              <circle cx={GLOBE.x} cy={GLOBE.y} r={GLOBE.r} fill="url(#tree-globe)" />
              {/* continents, clipped to the sphere */}
              <g clipPath="url(#tree-globe-clip)">
                <image
                  href="/images/globe-continents.png"
                  x={GLOBE.x - GLOBE.r}
                  y={GLOBE.y - GLOBE.r}
                  width={GLOBE.r * 2}
                  height={GLOBE.r * 2}
                  preserveAspectRatio="xMidYMid slice"
                  opacity={0.5}
                />
              </g>
              {/* crisp rim along the visible curvature */}
              <circle
                cx={GLOBE.x}
                cy={GLOBE.y}
                r={GLOBE.r}
                fill="none"
                stroke="var(--gold)"
                strokeWidth={2}
                opacity={0.5}
              />
              {/* origin "locations" pulsing on the globe */}
              {GLOBE_SOURCES.map((g, i) => (
                <circle
                  key={`src-${i}`}
                  cx={g.x}
                  cy={g.y}
                  r={3}
                  fill="url(#tree-gold)"
                  filter="url(#tree-pglow)"
                >
                  <animate
                    attributeName="r"
                    values="2;4.5;2"
                    dur="2.6s"
                    begin={`${i * 0.4}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
            </g>

            {/* root particles: world -> trunk */}
            {GLOBE_SOURCES.map((g, i) => {
              const d = rootPath(g)
              return [0, 1.6, 3.2].map((begin, j) => (
                <Particle
                  key={`rootp-${i}-${j}`}
                  d={d}
                  dur={4.6}
                  begin={begin + i * 0.25}
                />
              ))
            })}

            {/* branch particles: trunk -> causes (lines removed; only the
                flowing particles convey the impact path) */}
            {CAUSES.map((c, i) => {
              const d = branchPath(c)
              return [0, 1.5, 3].map((begin, j) => (
                <Particle
                  key={`branchp-${i}-${j}`}
                  d={d}
                  dur={4.2}
                  begin={begin + i * 0.18}
                />
              ))
            })}
          </svg>

          {/* Central logo (the tree itself) */}
          <div
            className="absolute z-10"
            style={{
              left: '50%',
              top: `${(462 / VIEW_H) * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: '23%',
            }}
          >
            <Image
              src="/images/tree-logo-transparent.png"
              alt="PPP infinity tree — capital takes root, yield branches into impact"
              width={260}
              height={300}
              className="h-auto w-full object-contain drop-shadow-[0_0_24px_color-mix(in_oklch,var(--gold)_45%,transparent)]"
            />
          </div>

          {/* Cause leaf nodes */}
          {CAUSES.map((c) => {
            const left = (c.x / VIEW_W) * 100
            const top = (c.y / VIEW_H) * 100
            const align =
              c.x < 300 ? 'left' : c.x > 700 ? 'right' : 'center'
            const tipPos =
              align === 'left'
                ? 'left-0'
                : align === 'right'
                  ? 'right-0'
                  : 'left-1/2 -translate-x-1/2'
            return (
              <div
                key={c.title}
                className="group absolute z-20"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <button
                  type="button"
                  aria-label={c.title}
                  className={`flex h-[clamp(2.25rem,6.2cqw,3.5rem)] w-[clamp(2.25rem,6.2cqw,3.5rem)] items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold group-hover:scale-110 ${
                    c.tone === 'gold'
                      ? 'border-gold/50 bg-primary/15 text-gold group-hover:border-gold group-hover:bg-primary/25'
                      : 'border-teal/50 bg-teal/15 text-teal group-hover:border-teal group-hover:bg-teal/25'
                  }`}
                >
                  <c.icon
                    className="h-[45%] w-[45%]"
                    aria-hidden="true"
                  />
                </button>

                {/* Hover/focus card */}
                <div
                  className={`pointer-events-none absolute top-[calc(100%+0.5rem)] z-30 w-[clamp(8.5rem,24cqw,13rem)] rounded-xl border border-border/60 bg-card/95 p-3 text-left opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 ${tipPos}`}
                >
                  <p className="font-heading text-xs font-semibold leading-tight">
                    {c.title}
                  </p>
                  <p className="mt-1 text-[0.7rem] leading-relaxed text-muted-foreground">
                    {c.body}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
