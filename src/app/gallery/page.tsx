import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Gallery } from "@/components/sections/Gallery";

export default function GalleryPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-foreground">
      <Navbar />
      <div className="pt-20">
        <Gallery />
      </div>
      <Footer />
    </main>
  );
}
