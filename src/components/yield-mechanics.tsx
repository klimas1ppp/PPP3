'use client'

import { Wallet, Layers, TrendingUp, HeartHandshake, ArrowRight } from 'lucide-react'
import { SectionDecor } from './decor/section-decor'
import { Reveal } from './decor/scroll-fx'

const FLOW = [
  {
    icon: Wallet,
    label: 'You deposit',
    code: 'deposit(USDC)',
    desc: 'USDC moves into the non-custodial vault on Base. You hold the keys.',
    tone: 'gold' as const,
  },
  {
    icon: Layers,
    label: 'Auto-allocated',
    code: 'supply() → Aave / Morpho',
    desc: 'The vault routes principal into audited, blue-chip lending markets.',
    tone: 'teal' as const,
  },
  {
    icon: TrendingUp,
    label: 'Yield accrues',
    code: 'accrue(interest)',
    desc: 'Interest streams in real time, on-chain and fully verifiable.',
    tone: 'gold' as const,
  },
  {
    icon: HeartHandshake,
    label: '100% to impact',
    code: 'harvest() → Philippines',
    desc: 'Only the yield is donated. Your principal stays yours, always.',
    tone: 'teal' as const,
  },
]

export function YieldMechanics() {
  return (
    <section
      id="yield"
      className="relative z-10 overflow-hidden py-24 sm:py-32"
      style={{
        background:
          'linear-gradient(180deg, var(--background), var(--section-tint), var(--background))',
      }}
    >
      <SectionDecor pattern="grid" variant="mixed" seed={1} network />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal/30 bg-card/40 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-teal-soft backdrop-blur-sm">
            On-chain yield engine
          </p>
          <h2 className="text-balance font-heading text-3xl font-semibold sm:text-4xl md:text-5xl">
            How the seed grows yield
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            <strong className="kw">Park your idle capital</strong> and put it to
            work for good. Every step runs on smart contracts you can inspect —
            no middlemen, no lock-ups, no touching your principal.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-4">
          {FLOW.map((step, i) => (
            <Reveal key={step.label} delay={i * 120} className="relative">
              <div className="group h-full rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/50">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                    step.tone === 'gold'
                      ? 'bg-primary/15 text-gold'
                      : 'bg-teal/15 text-teal'
                  }`}
                >
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold">
                  {step.label}
                </h3>
                <code className="mt-1 block font-mono text-xs text-muted-foreground/80">
                  {step.code}
                </code>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
              {i < FLOW.length - 1 && (
                <span className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-gold/60 md:block">
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </span>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
