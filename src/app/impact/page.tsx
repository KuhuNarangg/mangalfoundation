import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Impact } from "@/components/sections/Impact";

export default function ImpactPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-foreground">
      <Navbar />
      <div className="pt-20">
        <Impact />
      </div>
      <Footer />
    </main>
  );
}
