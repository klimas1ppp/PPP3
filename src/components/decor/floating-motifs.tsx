'use client'

import { Bitcoin, CircleDollarSign, Hexagon, Boxes, Link2, Coins } from 'lucide-react'

type Motif = {
  Icon: typeof Bitcoin
  className: string
  size: number
  delay: string
  duration: string
  tone: 'gold' | 'teal'
}

// Web3 / fintech iconography drifting in the background for industry flavor.
const MOTIFS: Motif[] = [
  { Icon: CircleDollarSign, className: 'left-[8%] top-[18%]', size: 34, delay: '0s', duration: '7s', tone: 'gold' },
  { Icon: Hexagon, className: 'right-[10%] top-[24%]', size: 40, delay: '1.2s', duration: '8.5s', tone: 'teal' },
  { Icon: Bitcoin, className: 'left-[14%] bottom-[22%]', size: 30, delay: '0.6s', duration: '9s', tone: 'gold' },
  { Icon: Boxes, className: 'right-[14%] bottom-[26%]', size: 32, delay: '2s', duration: '7.8s', tone: 'teal' },
  { Icon: Link2, className: 'left-[46%] top-[10%]', size: 26, delay: '1.6s', duration: '8s', tone: 'gold' },
  { Icon: Coins, className: 'right-[40%] bottom-[14%]', size: 28, delay: '0.9s', duration: '8.8s', tone: 'teal' },
]

export function FloatingMotifs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {MOTIFS.map((m, i) => (
        <span
          key={i}
          className={`animate-float absolute ${m.className} ${
            m.tone === 'gold' ? 'text-gold/25' : 'text-teal/25'
          }`}
          style={{ animationDelay: m.delay, animationDuration: m.duration }}
        >
          <m.Icon style={{ width: m.size, height: m.size }} strokeWidth={1.4} />
        </span>
      ))}
    </div>
  )
}
