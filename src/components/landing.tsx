"use client";

import { ScrollReveal } from "@/components/scroll-reveal";

export function Hero() {
  return (
    <section className="hero-landing">
      <div className="hero-content">
        <p className="hero-eyebrow hero-fade-in" style={{ animationDelay: "0.1s" }}>
          Principal Preserved · Impact Forever
        </p>
        <div className="hero-rule hero-fade-in" aria-hidden style={{ animationDelay: "0.2s" }} />

        <h1 className="hero-headline hero-fade-in" style={{ animationDelay: "0.3s" }}>
          Keep your principal,
          <br />
          <span className="hero-headline-accent">donate the yield.</span>
        </h1>

        <p className="hero-sub hero-fade-in" style={{ animationDelay: "0.45s" }}>
          Deposit USDC on Base. Your capital stays yours — only the yield funds
          sustainable impact in the Philippines.
        </p>

        <a href="#vault" className="hero-cta hero-fade-in" style={{ animationDelay: "0.6s" }}>
          Plant your seed
          <span className="hero-cta-arrow" aria-hidden>↓</span>
        </a>
      </div>
    </section>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Deposit USDC",
    body: "Connect your wallet and deposit USDC on Base. Your principal is always yours.",
  },
  {
    n: "02",
    title: "Earn yield",
    body: "Deposits route to audited lending protocols that generate sustainable yield.",
  },
  {
    n: "03",
    title: "Donate the yield",
    body: "100% of generated yield funds real-world impact. Your principal is untouched.",
  },
  {
    n: "04",
    title: "Withdraw anytime",
    body: "No lock-ups. Redeem your full principal whenever you choose, on-chain.",
  },
];

export function HowItWorks() {
  return (
    <section className="info-section landing-section" id="how-it-works">
      <ScrollReveal>
        <p className="section-eyebrow">How it works</p>
        <h2 className="info-heading section-title">
          Charity that costs you nothing but time
        </h2>
        <p className="info-lead section-lead">
          Principal-preserving philanthropy turns idle capital into a renewable
          engine for good — you never give away your money, only the yield it produces.
        </p>
      </ScrollReveal>

      <ol className="steps steps-cards">
        {STEPS.map((s, i) => (
          <ScrollReveal key={s.n} delay={i * 80}>
            <li className="step step-card">
              <span className="step-num">{s.n}</span>
              <div>
                <strong className="step-title">{s.title}</strong>
                <p className="step-body">{s.body}</p>
              </div>
            </li>
          </ScrollReveal>
        ))}
      </ol>
    </section>
  );
}

const YIELD_STEPS = [
  { fn: "deposit()", label: "You deposit", detail: "USDC moves into the non-custodial vault on Base." },
  { fn: "supply()", label: "Auto-allocated", detail: "Principal routes into audited Base lending markets." },
  { fn: "accrue()", label: "Yield accrues", detail: "Interest streams in real time, fully verifiable on-chain." },
  { fn: "harvest()", label: "100% to impact", detail: "Only yield is donated. Your principal stays yours." },
];

export function YieldEngine() {
  return (
    <section className="info-section landing-section yield-section" id="yield">
      <ScrollReveal>
        <p className="section-eyebrow">On-chain yield engine</p>
        <h2 className="info-heading section-title">How the seed grows yield</h2>
        <p className="info-lead section-lead">
          Every step runs on smart contracts you can inspect. No middlemen, no lock-ups,
          no touching your principal.
        </p>
      </ScrollReveal>

      <div className="yield-pipeline">
        {YIELD_STEPS.map((step, i) => (
          <ScrollReveal key={step.fn} delay={i * 70}>
            <div className="yield-step">
              <code className="yield-fn">{step.fn}</code>
              <strong className="yield-label">{step.label}</strong>
              <p className="yield-detail">{step.detail}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delay={120}>
        <div className="yield-stats">
          <div className="yield-stat">
            <span className="yield-stat-value">~4.8%</span>
            <span className="yield-stat-label">Blended lending APY</span>
          </div>
          <div className="yield-stat">
            <span className="yield-stat-value">100%</span>
            <span className="yield-stat-label">Principal withdrawable</span>
          </div>
          <div className="yield-stat">
            <span className="yield-stat-value">0%</span>
            <span className="yield-stat-label">Fees on your deposit</span>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

const IMPACT = [
  { title: "Farming & livestock", pct: "28%" },
  { title: "Fishing equipment", pct: "18%" },
  { title: "Medical bills", pct: "16%" },
  { title: "Education", pct: "14%" },
  { title: "Water systems", pct: "10%" },
  { title: "Housing & infrastructure", pct: "14%" },
];

export function Impact() {
  return (
    <section className="info-section landing-section" id="impact">
      <ScrollReveal>
        <p className="section-eyebrow">Teach to fish</p>
        <h2 className="info-heading section-title">
          We don&apos;t give a fish. We help communities fish for life.
        </h2>
        <p className="info-lead section-lead">
          Handouts fade. Sustainability lasts. Every dollar of yield is directed toward
          tools, skills, and infrastructure that let families build lasting independence.
        </p>
      </ScrollReveal>

      <ul className="impact-grid impact-grid-rich">
        {IMPACT.map((item, i) => (
          <ScrollReveal key={item.title} delay={i * 60}>
            <li className="impact-item impact-item-rich">
              <span className="impact-pct">{item.pct}</span>
              <span className="impact-title">{item.title}</span>
            </li>
          </ScrollReveal>
        ))}
      </ul>
    </section>
  );
}

const FAQ = [
  {
    q: "Who holds my funds?",
    a: "You do. Deposits go into a non-custodial smart-contract vault on Base. No one — not PPP, not the team — can move or withdraw your principal.",
  },
  {
    q: "What exactly gets donated?",
    a: "Only the yield. Your USDC is supplied to audited lending protocols; the interest is harvested and sent to verified programs in the Philippines.",
  },
  {
    q: "Can I withdraw anytime?",
    a: "Yes. No lock-ups and no withdrawal fees. Redeem part or all of your balance whenever you like — settlement happens on-chain.",
  },
  {
    q: "Which network and asset?",
    a: "USDC on Base. Low fees and fast settlement make micro-yield donations economical and fully transparent.",
  },
];

export function FAQSection() {
  return (
    <section className="info-section landing-section faq-section" id="faq">
      <ScrollReveal>
        <p className="section-eyebrow">FAQ</p>
        <h2 className="info-heading section-title">Questions, answered</h2>
      </ScrollReveal>

      <dl className="faq-list">
        {FAQ.map((item, i) => (
          <ScrollReveal key={item.q} delay={i * 50}>
            <div className="faq-item">
              <dt className="faq-q">{item.q}</dt>
              <dd className="faq-a">{item.a}</dd>
            </div>
          </ScrollReveal>
        ))}
      </dl>
    </section>
  );
}

const VAULT_TRUST = [
  { icon: "01", label: "Non-custodial", detail: "You hold the keys" },
  { icon: "02", label: "100% yield to impact", detail: "Principal untouched" },
  { icon: "03", label: "Withdraw anytime", detail: "No lock-ups" },
];

export function VaultTrustRing() {
  return (
    <div className="vault-trust-ring">
      {VAULT_TRUST.map((item, i) => (
        <ScrollReveal key={item.label} delay={i * 60}>
          <div className="vault-trust-pill">
            <span className="vault-trust-icon" aria-hidden>{item.icon}</span>
            <div>
              <strong className="vault-trust-label">{item.label}</strong>
              <span className="vault-trust-detail">{item.detail}</span>
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

export function VaultSectionIntro() {
  return (
    <ScrollReveal>
      <div className="vault-section-intro">
        <p className="section-eyebrow">Plant your seed</p>
        <h2 className="vault-section-title">
          Deposit USDC. Keep your principal. Donate the yield.
        </h2>
        <p className="vault-section-lead">
          Connect your wallet on Base — every transaction is verifiable on-chain.
        </p>
      </div>
    </ScrollReveal>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="site-footer-brand">PPP · Principal-Preserving Philanthropy</p>
      <p className="site-footer-tag">The seed is in your hands.</p>
      <nav className="site-footer-nav" aria-label="Footer">
        <a href="#how-it-works">How it works</a>
        <a href="#yield">Yield</a>
        <a href="#impact">Impact</a>
        <a href="#faq">FAQ</a>
      </nav>
      <p className="site-footer-copy">© 2026 PPP · Built on Base · Not financial advice</p>
    </footer>
  );
}
