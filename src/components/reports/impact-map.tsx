'use client'

import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'

const PalawanMap = dynamic(() => import('./palawan-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
})

const LEGEND = [
  { label: 'Water Systems', tone: 'var(--teal)' },
  { label: 'Farming & Livestock', tone: 'var(--gold)' },
  { label: 'Education', tone: 'var(--chart-4)' },
]

export function ImpactMap() {
  return (
    <section className="relative z-10 overflow-hidden border-y border-border/40 py-16 sm:py-20">
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-card/40 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-teal-soft backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            Where the yield works · Palawan
          </p>
          <h2 className="mt-3 text-balance font-heading text-2xl font-semibold sm:text-3xl">
            Explore our projects on the island
          </h2>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
            Each marker is a funded project on the island of Palawan, Philippines.
            Tap a dot to jump straight to that field report below.
          </p>
        </div>

        <div className="relative mt-10 overflow-hidden rounded-3xl border border-border/60 bg-card/40 shadow-[0_0_0_1px_oklch(0.79_0.13_88_/_0.06)]">
          <div className="h-[26rem] w-full sm:h-[32rem]">
            <PalawanMap />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {LEGEND.map((l) => (
            <span key={l.label} className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: l.tone }}
              />
              {l.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
