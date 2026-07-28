"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Utensils, Shirt, GraduationCap, Heart, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";

const getIconForCategory = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes("food")) return Utensils;
  if (lower.includes("cloth")) return Shirt;
  if (lower.includes("women") || lower.includes("edu")) return GraduationCap;
  if (lower.includes("temple") || lower.includes("mandir")) return Landmark;
  return Heart;
};

export function DonateCategories({ isHomePage = false }: { isHomePage?: boolean }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCats = async () => {
    try {
      const res = await fetch("/api/public/categories");
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch (e) {
      console.error("Failed to load donation categories", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-gray-50/50 min-h-[60vh] flex items-center justify-center">
        <div className="text-xl tracking-widest uppercase font-light text-gray-500 animate-pulse">
          Loading Initiatives...
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gray-50/50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-rose-50/50 blur-3xl opacity-50" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-orange-50/50 blur-3xl opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-heading text-charcoal mb-4"
          >
            Support a Cause
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 max-w-2xl mx-auto text-lg font-light"
          >
            Your contribution, no matter the size, makes a profound difference in the lives of those who need it most.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {categories.map((category, index) => {
            const IconComponent = getIconForCategory(category.title);
            
            return (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => router.push(`/categories/${category.slug}`)}
                className="flex flex-col bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 rounded-3xl overflow-hidden group cursor-pointer"
              >
                {/* Image Section */}
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    loading="lazy"
                    decoding="async"
                    className={`absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out ${category.title === "Women Empowerment" ? "object-top" : ""}`}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent opacity-80" />
                  <h2 className="absolute bottom-6 left-6 font-heading font-bold text-2xl md:text-3xl text-white drop-shadow-lg">
                    {category.title}
                  </h2>
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-8 flex flex-col flex-grow">
                  <p className="text-gray-600 font-light text-sm mb-8 leading-relaxed flex-grow line-clamp-3">
                    {category.description}
                  </p>



                  <div className="mt-auto">
                    <Button 
                      className="w-full bg-charcoal hover:bg-black text-white font-medium tracking-wide h-12 rounded-xl group-hover:shadow-md transition-all duration-300"
                    >
                      Donate Now
                    </Button>
                  </div>
                  
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
