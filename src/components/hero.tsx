'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { TreeScene } from './tree-scene'
import { FloatingMotifs } from './decor/floating-motifs'

export function Hero() {
  const fadeRef = useRef(1)
  const [containerOpacity, setContainerOpacity] = useState(1)
  const [treeCompact, setTreeCompact] = useState(false)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const shrinkTimer = window.setTimeout(() => setTreeCompact(true), 2800)
    return () => window.clearTimeout(shrinkTimer)
  }, [])

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
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pt-20"
    >
      <div
        className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center"
        style={{ opacity: containerOpacity }}
      >
        <p
          className="hero-rise mb-4 rounded-full border border-gold/30 bg-card/40 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-gold-soft backdrop-blur-sm"
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

        <div
          className="hero-rise relative my-4 w-full transition-[height,max-width,margin] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:my-6"
          style={{
            animationDelay: '1.9s',
            height: treeCompact ? 'clamp(9rem, 22vw, 13rem)' : 'clamp(16rem, 42vh, 22rem)',
            maxWidth: treeCompact ? 'clamp(9rem, 22vw, 13rem)' : 'min(100%, 28rem)',
          }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <TreeScene fade={fadeRef} compact={treeCompact} />
            <FloatingMotifs />
          </div>
        </div>

        <p
          className="hero-rise mx-auto max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          style={{ animationDelay: '2.0s' }}
        >
          The seed is in your hands. Deposit USDC, withdraw anytime, and let the
          yield grow real, sustainable impact for communities in the
          Philippines.
        </p>
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
