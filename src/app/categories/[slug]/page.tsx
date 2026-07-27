import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CATEGORIES } from "@/data/categories";
import { Button } from "@/components/ui/button";

// Note: In Next.js 15, params is a Promise. We must await it.
export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const category = CATEGORIES.find(c => c.slug === params.slug);

  if (!category) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={category.image}
            alt={category.title}
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading text-white mb-6">
            {category.title}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto font-light">
            {category.description}
          </p>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-16 md:py-24 bg-beige-light flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading text-charcoal mb-4">
              Make an Impact
            </h2>
            <p className="text-charcoal-light max-w-2xl mx-auto">
              Choose exactly how you want to support this cause. Every contribution, big or small, creates a tangible difference in someone's life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {category.packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-sand hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="p-6 md:p-8 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-heading text-charcoal font-semibold">{pkg.title}</h3>
                    <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm shrink-0">
                      ₹{pkg.amount}
                    </span>
                  </div>
                  
                  <p className="text-charcoal-light mb-6 text-sm flex-grow">
                    {pkg.description}
                  </p>
                  
                  {pkg.impactStatement && (
                    <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
                      <p className="text-sm font-medium text-green-800 flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✦</span> 
                        {pkg.impactStatement}
                      </p>
                    </div>
                  )}

                  <Link href={`/donate?category=${category.slug}&amount=${pkg.amount}`} className="mt-auto block">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-12 rounded-full">
                      Donate ₹{pkg.amount}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
