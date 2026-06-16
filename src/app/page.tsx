import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { YieldMechanics } from "@/components/yield-mechanics";
import { Impact } from "@/components/impact";
import { DepositSection } from "@/components/deposit-section";
import { Crew } from "@/components/crew";
import { Faq } from "@/components/faq";
import { Transparency } from "@/components/transparency";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <DepositSection />
        <HowItWorks />
        <YieldMechanics />
        <Impact />
        <Crew />
        <Faq />
        <Transparency />
      </main>
      <SiteFooter />
    </>
  );
}
