'use client'

import { Check, Loader, Circle } from 'lucide-react'
import { SectionDecor } from './decor/section-decor'
import { Reveal } from './decor/scroll-fx'

type Status = 'done' | 'active' | 'next'

const MILESTONES: {
  tvl: string
  title: string
  desc: string
  status: Status
}[] = [
  {
    tvl: '$250K',
    title: 'Genesis vault live on Base',
    desc: 'Non-custodial USDC vault deployed and audited. First yield harvested for clean-water wells.',
    status: 'done',
  },
  {
    tvl: '$750K',
    title: 'Livelihood programs scale',
    desc: 'Farming co-ops, livestock, and fishing equipment funded across three provinces.',
    status: 'done',
  },
  {
    tvl: '$1.3M',
    title: 'Education & healthcare fund',
    desc: 'Recurring yield underwrites scholarships, medical bills, and classroom rebuilds.',
    status: 'active',
  },
  {
    tvl: '$2M',
    title: 'Self-sustaining endowment',
    desc: 'Yield alone covers ongoing community programs — principal stays fully redeemable.',
    status: 'next',
  },
]

const ICON = { done: Check, active: Loader, next: Circle }

export function Roadmap() {
  return (
    <section
      id="roadmap"
      className="relative z-10 overflow-hidden py-24 sm:py-32"
      style={{
        background:
          'linear-gradient(180deg, var(--background), var(--section-tint), var(--background))',
      }}
    >
      <SectionDecor pattern="dots" variant="teal" seed={3} />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-card/40 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-gold-soft backdrop-blur-sm">
            Road to $2M
          </p>
          <h2 className="text-balance font-heading text-3xl font-semibold sm:text-4xl md:text-5xl">
            Growing toward a self-sustaining endowment
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Each milestone unlocks deeper, longer-lasting impact — funded purely
            by yield, never by your principal.
          </p>
        </Reveal>

        <ol className="relative mt-14 space-y-8 before:absolute before:left-[1.45rem] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border/60">
          {MILESTONES.map((m, i) => {
            const Icon = ICON[m.status]
            return (
              <Reveal as="li" key={m.tvl} delay={i * 100} className="relative flex gap-5">
                <span
                  className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border backdrop-blur-sm ${
                    m.status === 'next'
                      ? 'border-border/60 bg-card/60 text-muted-foreground'
                      : 'border-gold/50 bg-primary/15 text-gold'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${m.status === 'active' ? 'animate-spin-slow' : ''}`}
                    aria-hidden="true"
                  />
                </span>
                <div className="flex-1 rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-heading text-lg font-semibold">
                      {m.title}
                    </h3>
                    <span className="tabular font-mono text-sm font-semibold text-gold">
                      {m.tvl}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {m.desc}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
