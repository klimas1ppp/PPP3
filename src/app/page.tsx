import { Hero, HowItWorks, Impact } from "@/components/landing";
import { Logo } from "@/components/logo";
import { VaultApp } from "@/components/vault-app";
import { WalletButton } from "@/components/wallet-button";

export default function Home() {
  return (
    <>
      <header className="site-header">
        <Logo size={38} />
        <WalletButton />
      </header>
      <main className="page">
        <div className="page-inner">
          <Hero />
          <VaultApp />
          <HowItWorks />
          <Impact />
        </div>
      </main>
    </>
  );
}
