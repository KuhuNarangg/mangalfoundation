import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Contact } from "@/components/sections/Contact";
import { PageHero } from "@/components/sections/PageHero";

export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-foreground">
      <Navbar />
      <PageHero 
        title="Get in Touch" 
        description="We'd love to hear from you. Reach out to volunteer, partner, or ask a question." 
        image="/images/nico-smit-NFoerQuvzrs-unsplash.jpg" 
      />
      <Contact />
      <Footer />
    </main>
  );
}
