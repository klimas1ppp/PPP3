'use client'

import { ShieldCheck } from 'lucide-react'
import { Reveal } from './decor/scroll-fx'

export function Protocols() {
  return (
    <section className="relative z-10 overflow-hidden border-y border-border/40 bg-background py-10">
      <div
        className="glow-teal pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <Reveal className="relative px-4 text-center">
        <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-teal" aria-hidden="true" />
          Principal deployed across audited Base lending markets
        </p>
      </Reveal>
    </section>
  )
}
