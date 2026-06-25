import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { YieldMechanics } from "@/components/yield-mechanics";
import { LiveStats } from "@/components/stats/live-stats";
import { Impact } from "@/components/impact";
import { PhpImpact } from "@/components/php-impact";
import { Roadmap } from "@/components/roadmap";
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
        <LiveStats />
        <HowItWorks />
        <YieldMechanics />
        <Impact />
        <PhpImpact />
        <Roadmap />
        <Crew />
        <Faq />
        <Transparency />
      </main>
      <SiteFooter />
    </>
  );
}
