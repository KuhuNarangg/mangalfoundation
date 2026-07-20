import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Gallery } from "@/components/sections/Gallery";
import { PageHero } from "@/components/sections/PageHero";

export default function GalleryPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-foreground">
      <Navbar />
      <PageHero 
        title="Gallery" 
        description="A visual journey of our events, programs, and the lives we've touched together." 
        image="/images/varun-gaba-O_H7BlvtZ8Y-unsplash.jpg" 
      />
      <Gallery />
      <Footer />
    </main>
  );
}
