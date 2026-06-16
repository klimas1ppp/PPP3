"use client";

import { ShieldCheck } from "lucide-react";
import { VaultPanel } from "@/components/vault-app";

export function DepositSection() {
  return (
    <section
      id="deposit"
      className="relative z-10 overflow-hidden py-24 sm:py-32"
      style={{
        background:
          "linear-gradient(160deg, var(--background), var(--section-tint) 60%, var(--background))",
      }}
    >
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div
        className="glow-gold pointer-events-none absolute right-0 top-0 h-96 w-96"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gold">
              Plant your seed
            </p>
            <h2 className="mt-3 text-balance font-heading text-3xl font-semibold sm:text-4xl">
              Deposit USDC. Keep your principal. Donate the yield.
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Connect your wallet on Base and deposit USDC. Your principal stays
              fully yours and withdrawable at any time — only the yield is
              donated to sustainable impact in the Philippines.
            </p>
            <ul className="mt-6 flex flex-col gap-3 text-sm">
              <li className="flex items-center gap-2.5 text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-gold" aria-hidden="true" />
                Non-custodial — withdraw your full principal anytime
              </li>
              <li className="flex items-center gap-2.5 text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-gold" aria-hidden="true" />
                100% of generated yield goes to real-world impact
              </li>
              <li className="flex items-center gap-2.5 text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-gold" aria-hidden="true" />
                Every transaction verifiable on Base
              </li>
            </ul>
          </div>

          <VaultPanel />
        </div>
      </div>
    </section>
  );
}
