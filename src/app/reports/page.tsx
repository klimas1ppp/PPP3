import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ReportCard } from '@/components/reports/report-card'
import { ImpactMap } from '@/components/reports/impact-map'
import { REPORTS } from '@/lib/reports'

export const metadata: Metadata = {
  title: 'Field Reports — PPP',
  description:
    'On-the-ground reports showing exactly what donated yield achieved for communities in the Philippines: water systems, livestock, education, and more.',
}

function fmt(n: number) {
  return n.toLocaleString('en-US')
}

export default function ReportsPage() {
  const totalDeployed = REPORTS.reduce((s, r) => s + r.budget.total, 0)
  const totalReached = REPORTS.reduce((s, r) => s + r.beneficiaries, 0)

  return (
    <>
      <SiteHeader />
      <main className="pt-24">
        {/* Intro */}
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
          <div
            className="glow-gold pointer-events-none absolute -top-24 left-1/2 h-96 w-[42rem] -translate-x-1/2"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              Field reports
            </p>
            <h1 className="mt-3 text-balance font-heading text-4xl font-semibold leading-tight sm:text-5xl">
              See exactly what the yield achieved
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
              Every project is documented with photos, GPS-tagged locations, and
              a full budget of how donated yield was spent. No vague promises —
              just verifiable, on-the-ground impact.
            </p>

            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: 'Yield deployed', value: `${fmt(totalDeployed)} USDC` },
                { label: 'People reached', value: fmt(totalReached) },
                { label: 'Projects funded', value: fmt(REPORTS.length) },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm"
                >
                  <p className="font-heading text-2xl font-semibold tabular-nums text-gold">
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive island map */}
        <ImpactMap />

        {/* Reports list */}
        <section className="relative pb-24 sm:pb-32 pt-16 sm:pt-20">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
            {REPORTS.map((report, i) => (
              <ReportCard key={report.slug} report={report} index={i} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
