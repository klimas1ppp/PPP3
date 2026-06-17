import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'

const FOOTER_LINKS = [
  { label: 'How it works', href: '/#how' },
  { label: 'Live stats', href: '/#stats' },
  { label: 'Impact', href: '/#impact' },
  { label: 'Reports', href: '/reports' },
  { label: 'Contact', href: '/contact' },
]

export function SiteFooter() {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-border/40 bg-background py-14">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, oklch(0.79 0.13 88 / 0.5), transparent)',
        }}
        aria-hidden="true"
      />
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center sm:px-6">
        <div className="flex items-center gap-3">
          <BrandLogo size="lg" />
          <span className="flex flex-col items-start leading-none">
            <span className="font-heading text-3xl font-semibold text-gold">
              PPP
            </span>
            <span className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
              Principal-Preserving Philanthropy
            </span>
          </span>
        </div>
        <p className="max-w-md text-balance font-heading text-2xl">
          The seed is in your hands.
        </p>
        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
          A registered non-profit, principal-preserving philanthropy for the
          web3 community. Keep your principal, donate the yield, and grow
          lasting impact in the Philippines.
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} PPP · Built on Base · Not financial
          advice
        </p>
      </div>
    </footer>
  )
}
