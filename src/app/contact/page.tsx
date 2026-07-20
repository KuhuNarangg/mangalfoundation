import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Contact } from "@/components/sections/Contact";

export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-foreground">
      <Navbar />
      <div className="pt-20">
        <Contact />
      </div>
      <Footer />
    </main>
  );
}
