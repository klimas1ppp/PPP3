export function Hero() {
  return (
    <section className="hero">
      <p className="hero-eyebrow">Principal Preserved. Impact Forever.</p>
      <div className="hero-rule" aria-hidden />
      <h1 className="hero-headline">Keep Your Principal. Donate The Yield.</h1>
      <p className="hero-sub">
        Deposit USDC into a secure yield-generating vault on Base. Withdraw anytime
        while the yield supports real-world charitable projects.
      </p>
      <p className="hero-mission">Capital preserved. Good endures.</p>
      <div className="hero-rule hero-rule-short" aria-hidden />
    </section>
  );
}

const STEPS = [
  { n: "1", title: "Deposit USDC", body: "Connect your wallet and deposit into the vault on Base." },
  { n: "2", title: "Yield generates", body: "Funds earn yield through trusted DeFi infrastructure." },
  { n: "3", title: "Yield goes to charity", body: "Generated interest is directed to humanitarian causes." },
  { n: "4", title: "Withdraw anytime", body: "Your principal stays yours — withdraw whenever you need it." },
];

export function HowItWorks() {
  return (
    <section className="info-section">
      <h2 className="info-heading">How it works</h2>
      <ol className="steps">
        {STEPS.map((s) => (
          <li key={s.n} className="step">
            <span className="step-num">{s.n}</span>
            <div>
              <strong className="step-title">{s.title}</strong>
              <p className="step-body">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

const IMPACT = [
  "Clean water systems",
  "Community infrastructure",
  "School supplies",
  "Medical assistance",
  "Food security",
  "Farming & fishing equipment",
  "Solar energy projects",
  "Housing repairs",
];

export function Impact() {
  return (
    <section className="info-section">
      <h2 className="info-heading">Where yield creates impact</h2>
      <p className="info-lead">
        Your deposit can fund tangible humanitarian outcomes.
      </p>
      <ul className="impact-grid">
        {IMPACT.map((item) => (
          <li key={item} className="impact-item">{item}</li>
        ))}
      </ul>
    </section>
  );
}
