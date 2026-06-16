import type { Metadata } from 'next'
import { Mail, MessageCircle, Code2, Globe } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ContactForm } from '@/components/contact/contact-form'

export const metadata: Metadata = {
  title: 'Contact — PPP',
  description:
    'Get in touch with PPP, a non-profit principal-preserving philanthropy supporting communities in the Philippines. Partnerships, press, and donor support.',
}

const CHANNELS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@ppp.org',
    href: 'mailto:hello@ppp.org',
  },
  {
    icon: MessageCircle,
    label: 'Discord',
    value: 'discord.gg/ppp',
    href: 'https://discord.com',
  },
  {
    icon: Code2,
    label: 'GitHub',
    value: 'github.com/ppp',
    href: 'https://github.com',
  },
  {
    icon: Globe,
    label: 'Community',
    value: '@ppp',
    href: 'https://x.com',
  },
]

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-24">
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
          <div
            className="glow-gold pointer-events-none absolute -top-24 left-1/2 h-96 w-[42rem] -translate-x-1/2"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
                Get in touch
              </p>
              <h1 className="mt-3 text-balance font-heading text-4xl font-semibold leading-tight sm:text-5xl">
                Let&apos;s grow the seed together
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
                We&apos;re a non-profit, principal-preserving philanthropy built
                for the web3 community. Whether you want to partner, contribute,
                or simply learn more, we&apos;d love to hear from you.
              </p>
            </div>

            <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
              {/* Channels */}
              <div className="flex flex-col gap-4">
                {CHANNELS.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-gold transition-transform duration-300 group-hover:scale-110">
                      <c.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-medium">{c.label}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {c.value}
                      </span>
                    </span>
                  </a>
                ))}
                <p className="mt-2 rounded-2xl border border-border/40 bg-background/30 p-5 text-xs leading-relaxed text-muted-foreground">
                  PPP is a registered non-profit. 100% of generated yield funds
                  on-the-ground impact in the Philippines — our operations run
                  lean and transparent, fully on-chain.
                </p>
              </div>

              {/* Form */}
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
