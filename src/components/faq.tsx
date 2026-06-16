'use client'

import { Plus } from 'lucide-react'
import { SectionDecor } from './decor/section-decor'
import { Reveal } from './decor/scroll-fx'

const FAQS = [
  {
    q: 'Who holds my funds?',
    a: 'You do. Deposits go into a non-custodial smart-contract vault on Base. No one — not PPP, not the team — can move or withdraw your principal. You can redeem 100% of it at any time.',
  },
  {
    q: 'What exactly gets donated?',
    a: 'Only the yield. Your deposited USDC is supplied to audited lending protocols; the interest those markets generate is harvested and sent to verified programs in the Philippines. Your principal is never touched.',
  },
  {
    q: 'Can I withdraw anytime?',
    a: 'Yes. There are no lock-ups and no withdrawal fees. Redeem part or all of your balance whenever you like — settlement happens on-chain in a single transaction.',
  },
  {
    q: 'What are the risks?',
    a: 'As with any DeFi product, smart-contract and lending-market risk exist. We mitigate this by using only blue-chip, audited protocols (Aave, Morpho, Compound) and by open-sourcing the vault contract for public review.',
  },
  {
    q: 'How is impact verified?',
    a: 'Every harvest is recorded on-chain, and each funded project ships a field report with photos, GPS coordinates, and a full budget breakdown — published on our Reports page.',
  },
  {
    q: 'Which network and asset do you support?',
    a: 'USDC on Base. Base offers low fees and fast settlement, making micro-yield donations economical and fully transparent.',
  },
]

export function Faq() {
  return (
    <section
      id="faq"
      className="relative z-10 overflow-hidden py-24 sm:py-32"
      style={{
        background:
          'linear-gradient(180deg, var(--background), var(--section-tint), var(--background))',
      }}
    >
      <SectionDecor pattern="grid" variant="gold" seed={5} />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal/30 bg-card/40 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-teal-soft backdrop-blur-sm">
            FAQ
          </p>
          <h2 className="text-balance font-heading text-3xl font-semibold sm:text-4xl md:text-5xl">
            Questions, answered
          </h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {FAQS.map((item, i) => (
            <Reveal key={item.q} delay={i * 70}>
              <details className="group rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm transition-colors open:border-gold/50 hover:border-gold/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
                  <span className="font-heading text-base font-semibold sm:text-lg">
                    {item.q}
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-gold transition-transform duration-300 group-open:rotate-45">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </span>
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
