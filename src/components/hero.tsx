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
      className="relative flex min-h-[100svh] flex-col items-center overflow-hidden px-4 pb-24 pt-16 sm:pt-20"
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
          className="hero-rise mb-4 inline-block rounded-full border border-gold/30 bg-card/40 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-gold-soft backdrop-blur-sm"
          style={{ animationDelay: '1.4s' }}
        >
          Principal-preserving philanthropy
        </p>
        <h1
          className="hero-rise text-balance font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          style={{ animationDelay: '1.7s' }}
        >
          Keep your principal,
          <br />
          <span className="text-gold gold-glow">donate the yield.</span>
        </h1>
      </div>

      <p
        className="hero-rise relative z-10 mx-auto mt-auto max-w-xl text-pretty text-center text-base leading-relaxed text-muted-foreground sm:text-lg"
        style={{ animationDelay: '2.0s', opacity: containerOpacity }}
      >
        The seed is in your hands. Deposit USDC, withdraw anytime, and let the
        yield grow real, sustainable impact for communities in the Philippines.
      </p>

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
