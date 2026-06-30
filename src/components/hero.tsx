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
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pb-24 pt-16 sm:pt-20"
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

      {/* Light rays shining down from the top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[70vh]"
        style={{ opacity: containerOpacity }}
        aria-hidden="true"
      >
        <div
          className="hero-rays absolute left-1/2 top-0 h-full w-[160%] -translate-x-1/2"
          style={{
            background:
              'repeating-conic-gradient(from 180deg at 50% 0%, transparent 0deg 3.2deg, oklch(0.79 0.13 88 / 0.07) 3.2deg 4.4deg, transparent 4.4deg 8deg)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 100% at 50% 0%, black 0%, transparent 72%)',
            maskImage:
              'radial-gradient(ellipse 70% 100% at 50% 0%, black 0%, transparent 72%)',
          }}
        />
        <div
          className="absolute left-1/2 top-0 h-[40vh] w-[55vw] -translate-x-1/2"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, oklch(0.79 0.13 88 / 0.16), transparent 70%)',
          }}
        />
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
        className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-3xl flex-col items-center justify-between py-20 text-center sm:py-24"
        style={{ opacity: containerOpacity }}
      >
        {/* Top cluster: eyebrow + headline */}
        <div className="flex flex-col items-center">
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

        {/* Bottom cluster: supporting copy + CTAs (tree floats in the gap above) */}
        <div className="flex flex-col items-center">
          <p
            className="hero-rise mx-auto max-w-xl text-pretty text-base leading-relaxed text-foreground sm:text-lg"
            style={{ animationDelay: '2.0s' }}
          >
            The seed is in your hands. Deposit USDC, withdraw anytime, and let
            the yield grow real, sustainable impact for communities in the
            Philippines.
          </p>

          <div
            className="hero-rise mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
            style={{ animationDelay: '2.3s' }}
          >
            <a
              href="#deposit"
              className="rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-gold-soft"
            >
              Plant your seed
            </a>
            <a
              href="#how"
              className="rounded-full border border-gold/30 bg-card/40 px-8 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:border-gold/60"
            >
              How it works
            </a>
          </div>
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
