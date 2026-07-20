import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Impact } from "@/components/sections/Impact";
import { PageHero } from "@/components/sections/PageHero";

export default function ImpactPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-foreground">
      <Navbar />
      <PageHero 
        title="Our Impact" 
        description="Real change, real numbers. See how we are making a tangible difference in rural communities." 
        image="/images/larm-rmah-AEaTUnvneik-unsplash.jpg" 
      />
      <Impact />
      <Footer />
    </main>
  );
}
