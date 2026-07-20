import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OurCauses } from "@/components/sections/OurCauses";
import { DonateCTA } from "@/components/sections/DonateCTA";
import { PageHero } from "@/components/sections/PageHero";

export default function CausesPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-foreground">
      <Navbar />
      <PageHero 
        title="Our Initiatives" 
        description="Explore the causes we champion and see exactly where your contributions go." 
        image="/images/adrien-taylor-o4m8M9ri6wc-unsplash.jpg" 
      />
      <OurCauses />
      <DonateCTA />
      <Footer />
    </main>
  );
}
