'use client'

import { useState, type FormEvent } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'

const TOPICS = ['General', 'Partnership', 'Press', 'Donor support', 'Other']

export function ContactForm() {
  const [topic, setTopic] = useState('General')
  const [sent, setSent] = useState(false)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
  }

  if (sent) {
    return (
      <div className="gradient-border p-px">
        <div className="flex flex-col items-center gap-4 rounded-[calc(1rem-1px)] bg-card/80 px-6 py-16 text-center backdrop-blur-sm">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-gold">
            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
          </span>
          <h3 className="font-heading text-2xl font-semibold">Message received</h3>
          <p className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Thank you for reaching out. As a lean non-profit, a real human reads
            every message — we&apos;ll get back to you within a few days.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-2 text-sm font-medium text-gold underline-offset-4 hover:underline"
          >
            Send another message
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Name</span>
          <input
            required
            name="name"
            type="text"
            placeholder="Satoshi N."
            className="h-11 rounded-xl border border-border bg-background/50 px-4 text-sm outline-none transition-colors focus:border-gold/60"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Email</span>
          <input
            required
            name="email"
            type="email"
            placeholder="you@wallet.xyz"
            className="h-11 rounded-xl border border-border bg-background/50 px-4 text-sm outline-none transition-colors focus:border-gold/60"
          />
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-medium">Topic</legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                topic === t
                  ? 'border-gold bg-primary/15 text-gold'
                  : 'border-border bg-background/40 text-muted-foreground hover:border-gold/40'
              }`}
              aria-pressed={topic === t}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="mt-5 flex flex-col gap-2 text-sm">
        <span className="font-medium">Message</span>
        <textarea
          required
          name="message"
          rows={5}
          placeholder="Tell us how you'd like to help grow the seed…"
          className="resize-none rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none transition-colors focus:border-gold/60"
        />
      </label>

      <button
        type="submit"
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        Send message
      </button>
    </form>
  )
}
