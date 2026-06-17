'use client'

import { ShieldCheck } from 'lucide-react'
import { Reveal } from './decor/scroll-fx'

const PROTOCOLS = [
  { name: 'Aave v3', apy: '4.62%', alloc: '38%' },
  { name: 'Morpho Blue', apy: '5.21%', alloc: '24%' },
  { name: 'Moonwell', apy: '4.95%', alloc: '18%' },
  { name: 'Compound v3', apy: '4.30%', alloc: '12%' },
  { name: 'Fluid', apy: '5.08%', alloc: '8%' },
]

function Ticker() {
  return (
    <div className="flex shrink-0 items-center gap-4 pr-4">
      {PROTOCOLS.map((p) => (
        <div
          key={p.name}
          className="flex items-center gap-3 rounded-full border border-border/60 bg-card/60 px-5 py-2.5 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-teal" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
          </span>
          <span className="font-heading text-sm font-semibold text-foreground">
            {p.name}
          </span>
          <span className="font-mono text-xs text-gold">{p.apy}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {p.alloc}
          </span>
        </div>
      ))}
    </div>
  )
}

export function Protocols() {
  return (
    <section className="relative z-10 overflow-hidden border-y border-border/40 bg-background py-14">
      <div
        className="glow-teal pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <Reveal className="relative mb-8 px-4 text-center">
        <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-teal" aria-hidden="true" />
          Principal deployed across audited Base lending markets
        </p>
      </Reveal>

      {/* edge fade mask */}
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24"
          style={{
            background: 'linear-gradient(90deg, var(--background), transparent)',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24"
          style={{
            background: 'linear-gradient(270deg, var(--background), transparent)',
          }}
          aria-hidden="true"
        />
        <div className="flex w-max animate-marquee">
          <Ticker />
          <Ticker />
        </div>
      </div>
    </section>
  )
}
