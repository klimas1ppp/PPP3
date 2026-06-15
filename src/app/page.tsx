import {
  FAQSection,
  Hero,
  HowItWorks,
  Impact,
  SiteFooter,
  VaultSectionIntro,
  VaultTrustRing,
  YieldEngine,
} from "@/components/landing";
import { ScrollTreeBg } from "@/components/hero-tree";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { VaultApp } from "@/components/vault-app";
import { WalletButton } from "@/components/wallet-button";

export default function Home() {
  return (
    <>
      <header className="site-header">
        <Logo size={38} />
        <nav className="site-nav" aria-label="Main">
          <a href="#how-it-works">How it works</a>
          <a href="#impact">Impact</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="site-header-actions">
          <ThemeToggle />
          <WalletButton />
        </div>
      </header>

      <main className="page">
        <ScrollTreeBg />

        <div className="page-foreground">
          <Hero />

          <div className="page-body">
            <section className="vault-section" id="vault">
              <div className="vault-section-glow" aria-hidden />
              <div className="vault-section-inner">
                <VaultSectionIntro />
                <VaultTrustRing />
                <div className="vault-spotlight">
                  <VaultApp />
                </div>
                <p className="vault-section-note">
                  Wallet connection and balances are live on Base. Vault deposits run in
                  preview mode until the audited PPP vault contract is deployed.
                </p>
              </div>
            </section>

          <div className="page-inner">
            <HowItWorks />
            <YieldEngine />
            <Impact />
            <FAQSection />
            <SiteFooter />
          </div>
          </div>
        </div>
      </main>
    </>
  );
}
