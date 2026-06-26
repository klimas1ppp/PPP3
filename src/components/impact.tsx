import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ImpactTree } from './impact-tree'

export function Impact() {
  return (
    <section
      id="impact"
      className="relative z-10 overflow-hidden py-24 sm:py-32"
      style={{
        background:
          'linear-gradient(160deg, var(--background), var(--section-tint) 55%, var(--background))',
      }}
    >
      <div
        className="glow-gold pointer-events-none absolute -left-20 top-1/3 h-80 w-80"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              Teach to fish
            </p>
            <h2 className="mt-3 text-balance font-heading text-3xl font-semibold sm:text-4xl">
              We don&apos;t give a fish. We help communities fish for life.
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Many Filipino communities have the potential to thrive through
              agriculture, fishing, craftsmanship, and other local resources.
              That&apos;s why we prioritize initiatives that promote{' '}
              <strong className="kw">self-sufficiency</strong> — providing the
              tools, knowledge, and infrastructure needed to help people build
              sustainable livelihoods and long-term independence.
            </p>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              At the same time, we recognize that not every challenge can be
              solved through long-term investment alone. Unexpected medical
              expenses, <strong className="kw">natural disasters</strong>, and
              other urgent situations sometimes require immediate support. While
              our primary focus is helping communities become more resilient and
              self-reliant, we remain committed to responding to critical needs
              when they arise.
            </p>
            <Link
              href="/reports"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-sm font-semibold text-background transition-colors hover:bg-gold-soft"
            >
              See what we&apos;ve achieved
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-2xl border border-border/60">
                <Image
                  src="/images/impact-farming.png"
                  alt="Filipino farmers tending crops in a green rice field"
                  width={500}
                  height={620}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="overflow-hidden rounded-2xl border border-border/60">
                <Image
                  src="/images/impact-education.png"
                  alt="Filipino schoolchildren studying in a bright rural classroom"
                  width={500}
                  height={620}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-2xl border border-border/60">
                <Image
                  src="/images/impact-fishing.png"
                  alt="Filipino fishermen with an outrigger boat at sunrise"
                  width={500}
                  height={620}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="overflow-hidden rounded-2xl border border-border/60">
                <Image
                  src="/images/impact-water.png"
                  alt="Filipino community gathering clean water from a new village pump"
                  width={500}
                  height={620}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>

        <ImpactTree />
      </div>
    </section>
  )
}
