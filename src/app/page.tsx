import { VaultApp } from "@/components/vault-app";
import { WalletButton } from "@/components/wallet-button";

export default function Home() {
  return (
    <>
      <header className="site-header">
        <span className="site-logo">PPP</span>
        <WalletButton />
      </header>
      <main className="page">
        <VaultApp />
      </main>
    </>
  );
}
