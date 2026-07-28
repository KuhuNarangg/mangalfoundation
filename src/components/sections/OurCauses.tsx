"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useContent } from "@/components/ContentProvider";

import { CATEGORIES } from "@/data/categories";
export function OurCauses() {
  const content = useContent();
  return (
    <section id="causes" className="py-12 bg-beige text-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <motion.h2
            className="font-heading text-3xl md:text-4xl lg:text-5xl mb-4 text-charcoal"
          >
            {content.mission.heading}
          </motion.h2>
          <motion.p
            transition={{ delay: 0.2 }}
            className="text-base text-charcoal-light max-w-3xl mx-auto font-light"
          >
            {content.mission.description}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {CATEGORIES.map((cause, index) => (
            <motion.div
              key={cause.title}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group bg-beige-light rounded-lg overflow-hidden shadow-sm border border-sand hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <Link href={`/categories/${cause.slug}`} className="flex flex-col h-full cursor-pointer">
                <div className="relative w-full aspect-video overflow-hidden bg-sand">
                  <Image
                    src={cause.image}
                    alt={cause.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={`object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${cause.title === "Women Empowerment" ? "object-top" : ""}`}
                  />
                </div>
                <div className="p-5 flex-grow">
                  <h3 className="font-heading text-xl mb-2 text-charcoal">
                    {cause.title}
                  </h3>
                  <p className="text-charcoal-light font-light leading-snug text-xs md:text-sm">
                    {cause.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
