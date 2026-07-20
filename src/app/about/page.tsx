import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { About } from "@/components/sections/About";
import { Testimonials } from "@/components/sections/Testimonials";

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-foreground">
      <Navbar />
      <div className="pt-20">
        <About />
        <Testimonials />
      </div>
      <Footer />
    </main>
  );
}
