import { ShieldCheck, Eye, Lock, FileText } from 'lucide-react'

const POINTS = [
  {
    icon: ShieldCheck,
    title: '100% yield to impact',
    body: 'Not 90%. Not 95%. Every cent of generated yield flows to on-the-ground projects.',
  },
  {
    icon: Eye,
    title: 'Fully on-chain',
    body: 'Deposits, withdrawals, and disbursements are verifiable on Base. Nothing is hidden.',
  },
  {
    icon: Lock,
    title: 'Your principal is safe',
    body: 'Funds sit in audited lending protocols. Withdraw your full principal anytime.',
  },
  {
    icon: FileText,
    title: 'Open reporting',
    body: 'Impact disbursements are published on-chain and verifiable on Base.',
  },
]

export function Transparency() {
  return (
    <section
      id="transparency"
      className="relative z-10 overflow-hidden py-24 sm:py-32"
      style={{
        background:
          'linear-gradient(180deg, var(--background), var(--section-tint))',
      }}
    >
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div
        className="glow-teal pointer-events-none absolute -bottom-24 left-1/2 h-80 w-[40rem] -translate-x-1/2"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
            Maximum transparency
          </p>
          <h2 className="mt-3 text-balance font-heading text-3xl font-semibold sm:text-4xl">
            Trust, verified on-chain
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Web3 lets us prove our promises instead of asking you to take them
            on faith. By{' '}
            <strong className="kw">cooperating with local authorities</strong>{' '}
            and publishing every flow of value on-chain, we hold ourselves to{' '}
            <strong className="kw text-gold">maximum transparency</strong>.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map((p) => (
            <div
              key={p.title}
              className="group rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-gold transition-transform duration-300 group-hover:scale-110">
                <p.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-heading text-lg font-semibold">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
