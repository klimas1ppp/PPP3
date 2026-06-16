import Image from 'next/image'
import {
  Sprout,
  Fish,
  Stethoscope,
  GraduationCap,
  Droplets,
  Home,
  Rocket,
} from 'lucide-react'

const FOCUS = [
  {
    icon: Sprout,
    title: 'Farming & livestock',
    body: 'Seeds, tools, and animals so families can grow food and income year after year.',
  },
  {
    icon: Fish,
    title: 'Fishing equipment',
    body: 'Boats, nets, and gear that turn the sea into a renewable livelihood.',
  },
  {
    icon: Stethoscope,
    title: 'Medical bills',
    body: 'Covering urgent care and treatments that families cannot shoulder alone.',
  },
  {
    icon: GraduationCap,
    title: 'Education',
    body: 'Tuition, supplies, and scholarships that open doors for the next generation.',
  },
  {
    icon: Droplets,
    title: 'Water systems',
    body: 'Clean water infrastructure for healthier, more resilient communities.',
  },
  {
    icon: Home,
    title: 'Housing & infrastructure',
    body: 'Repairs and community structures that rebuild after storms and hardship.',
  },
  {
    icon: Rocket,
    title: 'Funding startups',
    body: 'Seed capital and mentorship for small local businesses that create jobs and keep income in the community.',
  },
]

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
              Handouts fade. Sustainability lasts. Every dollar of yield is
              directed toward tools, skills, and infrastructure so that{' '}
              <strong className="kw">
                Filipinos can live off the land and be self-sustainable
              </strong>{' '}
              — building lasting independence, not temporary relief.
            </p>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              From farming and fishing gear to medical care, education, and
              clean water, we go further: by{' '}
              <strong className="kw">funding local startups</strong> we{' '}
              <strong className="kw">create local jobs</strong> that keep
              growing long after the seed is sown.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="mt-8 overflow-hidden rounded-2xl border border-border/60">
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
                src="/images/impact-fishing.png"
                alt="Filipino fishermen with an outrigger boat at sunrise"
                width={500}
                height={620}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FOCUS.map((item, i) => {
            const teal = i % 2 === 1
            return (
            <div
              key={item.title}
              className={`group rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 ${
                teal ? 'hover:border-teal/50' : 'hover:border-gold/50'
              }`}
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                  teal ? 'bg-teal/15 text-teal' : 'bg-primary/15 text-gold'
                }`}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-heading text-lg font-semibold">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
