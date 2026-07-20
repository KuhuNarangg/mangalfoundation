import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OurCauses } from "@/components/sections/OurCauses";
import { DonateCTA } from "@/components/sections/DonateCTA";

export default function CausesPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-foreground">
      <Navbar />
      <div className="pt-20">
        <OurCauses />
        <DonateCTA />
      </div>
      <Footer />
    </main>
  );
}
