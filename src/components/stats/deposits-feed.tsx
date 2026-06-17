'use client'

import { useEffect, useState } from 'react'
import { ArrowDownToLine } from 'lucide-react'
import { SIM_EPOCH, type Deposit } from '@/lib/use-live-stats'

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function timeAgo(ts: number, now: number) {
  const s = Math.max(0, Math.floor((now - ts) / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

export function DepositsFeed({ deposits }: { deposits: Deposit[] }) {
  // Start at the fixed simulation epoch so SSR and first client render match,
  // then switch to the real clock after mount and tick every second.
  const [now, setNow] = useState(SIM_EPOCH)
  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold">Latest deposits</h3>
        <span className="text-xs text-muted-foreground">
          Scroll for last 15 · Base
        </span>
      </div>
      <ul className="feed-scroll flex max-h-[26rem] flex-col gap-2 overflow-y-auto pr-2">
        {deposits.map((d, i) => (
          <li
            key={d.id}
            className="flex shrink-0 items-center justify-between rounded-xl border border-border/40 bg-background/40 px-4 py-3"
            style={{ animation: i === 0 ? 'pulse 1s ease-out 1' : undefined }}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-gold">
                <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="font-mono text-sm">{shortAddr(d.address)}</p>
                <p className="text-xs text-muted-foreground">
                  {timeAgo(d.timestamp, now)}
                </p>
              </div>
            </div>
            <p className="font-semibold tabular-nums text-gold">
              +$
              {d.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
