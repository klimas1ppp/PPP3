'use client'

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

/** Reveals children with a fade-rise the first time they scroll into view. */
export function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className = '',
}: {
  children: ReactNode
  as?: keyof React.JSX.IntrinsicElements
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return createElement(
    Tag,
    {
      ref,
      className: `reveal ${visible ? 'is-visible' : ''} ${className}`,
      style: { transitionDelay: `${delay}ms` },
    },
    children,
  )
}

/**
 * A decorative element that translates and rotates based on the page scroll
 * position — used for "rolling on scroll" background objects.
 */
export function ScrollRoller({
  children,
  className = '',
  speed = 0.15,
  spin = 0.08,
  style,
}: {
  children: ReactNode
  className?: string
  /** vertical translate factor relative to scrollY */
  speed?: number
  /** rotation degrees per scrolled pixel */
  spin?: number
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    const update = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      // progress of the element's center through the viewport
      const center = rect.top + rect.height / 2
      const fromCenter = center - window.innerHeight / 2
      el.style.transform = `translate3d(0, ${(-fromCenter * speed).toFixed(
        1,
      )}px, 0) rotate(${(fromCenter * spin).toFixed(2)}deg)`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [speed, spin])

  return (
    <div
      ref={ref}
      className={`pointer-events-none will-change-transform ${className}`}
      style={style}
      aria-hidden="true"
    >
      {children}
    </div>
  )
}
