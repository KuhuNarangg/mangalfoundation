import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { About } from "@/components/sections/About";
import { Testimonials } from "@/components/sections/Testimonials";
import { PageHero } from "@/components/sections/PageHero";

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-foreground">
      <Navbar />
      <PageHero 
        title="About Us" 
        description="Discover our mission, vision, and the story behind Mangal Guruji Foundation." 
        image="/images/bw1.jpg" 
      />
      <About />
      <Testimonials />
      <Footer />
    </main>
  );
}
