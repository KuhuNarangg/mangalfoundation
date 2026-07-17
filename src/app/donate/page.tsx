import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DonateHero } from "@/components/donate/DonateHero";
import { DonateCategories } from "@/components/donate/DonateCategories";
import { WhyDonate } from "@/components/donate/WhyDonate";
import { DonateImpact } from "@/components/donate/DonateImpact";
import { HowItWorks } from "@/components/donate/HowItWorks";
import { SuccessStories } from "@/components/donate/SuccessStories";
import { FAQ } from "@/components/donate/FAQ";
import { FinalCTA } from "@/components/donate/FinalCTA";

export const metadata = {
  title: "Donate | Mangal Guruji Foundation",
  description: "Your kindness can change someone's tomorrow. Donate to support education, healthcare, and empowerment.",
};

export default function DonatePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <DonateHero />
      <DonateCategories />
      <WhyDonate />
      <DonateImpact />
      <HowItWorks />
      <SuccessStories />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
