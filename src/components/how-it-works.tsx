import { Wallet, TrendingUp, HeartHandshake, RefreshCw } from 'lucide-react'
import { SectionDecor } from './decor/section-decor'

const STEPS = [
  {
    icon: Wallet,
    title: 'Deposit USDC',
    body: 'Connect your wallet and deposit USDC on Base. Your principal is always yours.',
  },
  {
    icon: TrendingUp,
    title: 'Earn yield',
    body: 'Deposits are routed to audited lending protocols that generate sustainable yield.',
  },
  {
    icon: HeartHandshake,
    title: 'Donate the yield',
    body: '100% of the yield funds real-world impact in the Philippines. Your principal is untouched.',
  },
  {
    icon: RefreshCw,
    title: 'Withdraw anytime',
    body: 'No lock-ups. Redeem your full principal whenever you choose, instantly.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how"
      className="relative z-10 overflow-hidden py-24 sm:py-32"
      style={{
        background:
          'linear-gradient(180deg, var(--background), var(--section-tint), var(--background))',
      }}
    >
      <SectionDecor pattern="grid" variant="mixed" seed={1} network />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
            How it works
          </p>
          <h2 className="mt-3 text-balance font-heading text-3xl font-semibold sm:text-4xl">
            Charity that costs you nothing but time
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            PPP is a <strong className="kw">non-profit organization</strong>.
            Park your idle capital and put it to work for good. — you never give away your money, only the
            yield it produces. The result:{' '}
            <strong className="kw text-gold">possible infinite impact</strong>{' '}
            from capital that stays entirely yours.
          </p>
        </div>

        <ol className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="group relative rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-[0_12px_40px_-12px_oklch(0.79_0.13_88_/_0.4)]"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-gold transition-transform duration-300 group-hover:scale-110">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-heading text-3xl font-semibold text-border transition-colors duration-300 group-hover:text-gold/40">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-5 font-heading text-xl font-semibold">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
