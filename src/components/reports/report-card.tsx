import Image from 'next/image'
import { MapPin, Users, Wallet, ExternalLink, Download } from 'lucide-react'
import { mapsUrl, type Report } from '@/lib/reports'
import { SocialLinks } from './social-links'

const BAR_TONES = ['bg-gold', 'bg-teal', 'bg-chart-4', 'bg-chart-5']

function fmt(n: number) {
  return n.toLocaleString('en-US')
}

export function ReportCard({ report, index }: { report: Report; index: number }) {
  const reversed = index % 2 === 1
  const date = new Date(report.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article
      id={`report-${report.slug}`}
      className="scroll-mt-24 overflow-hidden rounded-3xl border border-border/60 bg-card/60 backdrop-blur-sm transition-all duration-500 target:border-gold target:shadow-[0_0_0_2px_oklch(0.79_0.13_88_/_0.5)]"
    >
      <div className={`grid gap-0 lg:grid-cols-2 ${reversed ? 'lg:[direction:rtl]' : ''}`}>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:[direction:ltr]">
          <Image
            src={report.image || '/placeholder.svg'}
            alt={report.imageAlt}
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <span className="absolute left-4 top-4 rounded-full border border-gold/40 bg-background/80 px-3 py-1 text-xs font-medium uppercase tracking-wider text-gold backdrop-blur-sm">
            {report.category}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 p-6 sm:p-8 lg:[direction:ltr]">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {date}
            </p>
            <h3 className="mt-2 text-balance font-heading text-2xl font-semibold leading-tight">
              {report.title}
            </h3>
          </div>

          {report.body.map((p, i) => (
            <p
              key={i}
              className={`text-sm leading-relaxed text-muted-foreground ${i > 0 ? 'hidden sm:block' : ''}`}
            >
              {p}
            </p>
          ))}

          {/* Location + beneficiaries */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={mapsUrl(report.location.lat, report.location.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs text-foreground transition-colors hover:border-teal/60 hover:bg-teal/10"
            >
              <MapPin className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
              {report.location.name}
              <span className="font-mono text-[0.65rem] text-muted-foreground">
                {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
              </span>
              <ExternalLink className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-teal" aria-hidden="true" />
            </a>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
              {fmt(report.beneficiaries)} people reached
            </span>
          </div>

          {/* Budget */}
          <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <Wallet className="h-4 w-4 text-gold" aria-hidden="true" />
                Yield deployed
              </span>
              <span className="font-heading text-lg font-semibold tabular-nums text-gold">
                {fmt(report.budget.total)} {report.budget.currency}
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-2.5">
              {report.budget.items.map((item, i) => {
                const pct = (item.amount / report.budget.total) * 100
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="tabular-nums text-foreground">
                        {fmt(item.amount)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-background/70">
                      <div
                        className={`h-full rounded-full ${BAR_TONES[i % BAR_TONES.length]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Documentation downloads */}
          {report.documents.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Project documentation
              </p>
              <div className="flex flex-wrap gap-2">
                {report.documents.map((doc) => (
                  <a
                    key={doc.file}
                    href={doc.file}
                    download
                    className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-gold/60 hover:bg-primary/10 hover:text-gold"
                  >
                    <Download
                      className="h-3.5 w-3.5 text-gold transition-transform group-hover:translate-y-0.5"
                      aria-hidden="true"
                    />
                    {doc.label}
                    <span className="font-mono text-[0.65rem] text-muted-foreground">
                      {doc.kind}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Socials */}
          <div className="mt-auto flex items-center justify-between gap-4 border-t border-border/40 pt-5">
            <span className="text-xs text-muted-foreground">
              Follow this project
            </span>
            <SocialLinks socials={report.socials} />
          </div>
        </div>
      </div>
    </article>
  )
}
