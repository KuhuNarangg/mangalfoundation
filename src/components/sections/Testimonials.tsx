"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useContent } from "@/components/ContentProvider";

export function Testimonials() {
  const content = useContent();
  return (
    <section className="bg-white text-charcoal relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        
        {/* Left Side: Massive Image */}
        <div className="relative h-[50vh] lg:h-auto overflow-hidden">
          <Image
            src="/images/quote.jpg"
            alt="Children supported by Mangal Guruji Foundation"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-top"
          />
        </div>

        {/* Right Side: Content */}
        <div className="flex flex-col justify-center p-12 md:p-24 lg:p-32 relative">
          <motion.div
            className="mb-8"
          >
            <span className="text-sand text-[5rem] md:text-[10rem] font-heading leading-none opacity-30 absolute top-6 left-6 md:top-24 md:left-24">"</span>
          </motion.div>
          
          <motion.div
            transition={{ delay: 0.2 }}
            className="relative z-10"
          >
            <p className="font-heading text-4xl md:text-5xl lg:text-6xl font-medium leading-tight mb-16 text-charcoal">
              {content.testimonial.quote}
            </p>
            <div className="inline-block border-l-4 border-charcoal pl-6">
              <p className="font-bold uppercase tracking-[0.2em] text-sm md:text-base text-charcoal">{content.testimonial.author}</p>
              <p className="text-gray-500 text-sm mt-2 font-light tracking-widest uppercase">{content.testimonial.role}</p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
