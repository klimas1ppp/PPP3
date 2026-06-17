import type { Report } from '@/lib/reports'

const ICONS: { key: keyof Report['socials']; label: string; src: string }[] = [
  { key: 'twitter', label: 'X (Twitter)', src: '/icons/x.svg' },
  { key: 'facebook', label: 'Facebook', src: '/icons/facebook.svg' },
  { key: 'instagram', label: 'Instagram', src: '/icons/instagram.svg' },
  { key: 'youtube', label: 'YouTube', src: '/icons/youtube.svg' },
]

export function SocialLinks({ socials }: { socials: Report['socials'] }) {
  return (
    <div className="flex items-center gap-2">
      {ICONS.map(({ key, label, src }) => {
        const href = socials[key]
        if (!href) return null
        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow this project on ${label}`}
            className="group flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background/40 transition-colors hover:border-gold/60 hover:bg-primary/10"
          >
            <span
              className="h-4 w-4 bg-muted-foreground transition-colors group-hover:bg-gold"
              style={{
                maskImage: `url(${src})`,
                WebkitMaskImage: `url(${src})`,
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
              }}
            />
          </a>
        )
      })}
    </div>
  )
}
