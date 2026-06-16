'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { TreeScene } from './tree-scene'
import { FloatingMotifs } from './decor/floating-motifs'

export function Hero() {
  const fadeRef = useRef(1)
  const [containerOpacity, setContainerOpacity] = useState(1)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        const vh = window.innerHeight
        const progress = Math.min(1, Math.max(0, window.scrollY / (vh * 0.85)))
        const fade = 1 - progress
        fadeRef.current = fade
        setContainerOpacity(fade)
        rafRef.current = null
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4"
    >
      {/* Fixed 3D layer that fades on scroll */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          opacity: containerOpacity,
          visibility: containerOpacity <= 0.01 ? 'hidden' : 'visible',
        }}
        aria-hidden="true"
      >
        <TreeScene fade={fadeRef} />
        <FloatingMotifs />
      </div>

      {/* Radial vignette behind copy for legibility */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 45%, var(--background) 92%)',
        }}
        aria-hidden="true"
      />

      <div
        className="relative z-10 mx-auto max-w-3xl text-center"
        style={{ opacity: containerOpacity }}
      >
        <p
          className="hero-rise mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-card/40 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-gold-soft backdrop-blur-sm"
          style={{ animationDelay: '1.4s' }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-gold" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
          </span>
          Principal-preserving philanthropy · Base · USDC
        </p>
        <h1
          className="hero-rise text-balance font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          style={{ animationDelay: '1.7s' }}
        >
          Keep your principal,
          <br />
          <span className="text-gold gold-glow">donate the yield.</span>
        </h1>
        <p
          className="hero-rise mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          style={{ animationDelay: '2.0s' }}
        >
          The seed is in your hands. Deposit USDC, withdraw anytime, and let the
          yield grow real, sustainable impact for communities in the
          Philippines.
        </p>
        <div
          className="hero-rise mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: '2.3s' }}
        >
          <a
            href="#deposit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
          >
            Plant your seed
          </a>
          <a
            href="#how"
            className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card/40 px-8 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-card"
          >
            How it works
          </a>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-muted-foreground"
        style={{ opacity: containerOpacity }}
      >
        <div className="hero-rise" style={{ animationDelay: '2.6s' }}>
          <ArrowDown className="h-5 w-5 animate-bounce" aria-hidden="true" />
          <span className="sr-only">Scroll down</span>
        </div>
      </div>
    </section>
  )
}
