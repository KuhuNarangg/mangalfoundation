import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSlider } from "@/components/sections/HeroSlider";
import { About } from "@/components/sections/About";
import { OurCauses } from "@/components/sections/OurCauses";
import { Impact } from "@/components/sections/Impact";
import { Gallery } from "@/components/sections/Gallery";
import { Testimonials } from "@/components/sections/Testimonials";
import { DonateCTA } from "@/components/sections/DonateCTA";
import { Contact } from "@/components/sections/Contact";
import { DonationPreview } from "@/components/sections/DonationPreview";
import { VolunteerCTA } from "@/components/sections/VolunteerCTA";

export default function Home2() {
  return (
    <main className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-foreground">
      <Navbar />
      <HeroSlider />
      <DonationPreview />
      <About />
      <OurCauses />
      <Impact />
      <Testimonials />
      <Gallery />
      <DonateCTA />
      <VolunteerCTA />
      <Contact />
      <Footer />
    </main>
  );
}
