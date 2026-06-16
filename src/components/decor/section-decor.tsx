'use client'

import {
  Hexagon,
  Bitcoin,
  CircleDollarSign,
  Boxes,
  Sparkle,
  Triangle,
} from 'lucide-react'
import { ScrollRoller } from './scroll-fx'
import { NetworkCanvas } from './network-canvas'

type Variant = 'gold' | 'teal' | 'mixed'

const ICONS = [Hexagon, Bitcoin, CircleDollarSign, Boxes, Sparkle, Triangle]

/**
 * Layered, scroll-reactive background for content sections: a faint pattern,
 * two drifting glow blobs, and a few crypto glyphs that roll as you scroll.
 */
export function SectionDecor({
  pattern = 'grid',
  variant = 'gold',
  seed = 0,
  network = false,
}: {
  pattern?: 'grid' | 'dots' | 'none'
  variant?: Variant
  seed?: number
  network?: boolean
}) {
  const blobA = variant === 'teal' ? 'glow-teal' : 'glow-gold'
  const blobB = variant === 'gold' ? 'glow-gold' : 'glow-teal'

  // deterministic positions derived from seed so SSR matches client
  const rollers = [
    { Icon: ICONS[seed % ICONS.length], pos: 'left-[6%] top-[14%]', size: 30, speed: 0.12, spin: 0.06, tone: 'gold' },
    { Icon: ICONS[(seed + 2) % ICONS.length], pos: 'right-[8%] top-[30%]', size: 40, speed: -0.1, spin: -0.1, tone: 'teal' },
    { Icon: ICONS[(seed + 4) % ICONS.length], pos: 'left-[12%] bottom-[16%]', size: 26, speed: 0.16, spin: 0.12, tone: 'gold' },
    { Icon: ICONS[(seed + 1) % ICONS.length], pos: 'right-[14%] bottom-[20%]', size: 34, speed: -0.14, spin: 0.08, tone: 'teal' },
  ] as const

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {network && <NetworkCanvas className="opacity-50" />}
      {pattern !== 'none' && (
        <div
          className={`absolute inset-0 ${pattern === 'grid' ? 'bg-grid' : 'bg-dots'} opacity-60`}
        />
      )}
      <div className={`animate-drift absolute -left-24 top-0 h-80 w-80 ${blobA}`} />
      <div
        className={`animate-drift absolute -right-24 bottom-0 h-96 w-96 ${blobB}`}
        style={{ animationDelay: '6s' }}
      />
      {rollers.map((r, i) => (
        <ScrollRoller
          key={i}
          className={`absolute ${r.pos} ${r.tone === 'gold' ? 'text-gold/20' : 'text-teal/20'}`}
          speed={r.speed}
          spin={r.spin}
        >
          <r.Icon style={{ width: r.size, height: r.size }} strokeWidth={1.3} />
        </ScrollRoller>
      ))}
    </div>
  )
}
