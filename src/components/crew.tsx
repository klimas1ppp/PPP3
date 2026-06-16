import Image from 'next/image'

const CREW = [
  {
    name: 'Mateo Rivera',
    role: 'Founder & Steward',
    image: '/images/crew-founder.png',
    bio: 'Set out to prove that charity can cost you nothing but time — and that idle capital can fund infinite impact.',
  },
  {
    name: 'Maria Santos',
    role: 'Operations Lead · Philippines',
    image: '/images/crew-ops.png',
    bio: 'Runs day-to-day operations on the ground and makes sure every project creates real local jobs.',
  },
  {
    name: 'Daniel Cruz',
    role: 'Smart Contract Engineer',
    image: '/images/crew-engineer.png',
    bio: 'Builds and audits the on-chain vault so your principal stays safe and every flow is verifiable.',
  },
  {
    name: 'Eduardo Lim',
    role: 'Field Coordinator',
    image: '/images/crew-coordinator.png',
    bio: 'Lives in Palawan and coordinates directly with families and local authorities to deliver each project.',
  },
]

export function Crew() {
  return (
    <section
      id="crew"
      className="relative z-10 overflow-hidden py-24 sm:py-32"
      style={{
        background:
          'linear-gradient(180deg, var(--background), var(--section-tint), var(--background))',
      }}
    >
      <div
        className="bg-grid pointer-events-none absolute inset-0 opacity-50"
        aria-hidden="true"
      />
      <div
        className="glow-teal pointer-events-none absolute -right-20 top-1/4 h-80 w-80"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
            Meet the crew
          </p>
          <h2 className="mt-3 text-balance font-heading text-3xl font-semibold sm:text-4xl">
            A small team, a <span className="kw text-gold">big mission</span>
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            We are a lean, hands-on crew split between web3 builders and people
            on the ground in the Philippines. Together we{' '}
            <strong className="kw">create local jobs</strong> and turn donated
            yield into lasting impact.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CREW.map((member) => (
            <article
              key={member.name}
              className="group overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/50"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={member.image || '/placeholder.svg'}
                  alt={`Portrait of ${member.name}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="p-5">
                <h3 className="font-heading text-lg font-semibold">
                  {member.name}
                </h3>
                <p className="mt-0.5 text-sm font-medium text-gold">
                  {member.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {member.bio}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
