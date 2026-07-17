"use client";

import { motion } from "framer-motion";

const photos = [
  "/images/joel-muniz-qvzjG2pF4bE-unsplash.jpg",
  "/images/nico-smit-NFoerQuvzrs-unsplash.jpg",
  "/images/srimathi-jayaprakash-uO1MUMn0Xzc-unsplash.jpg",
  "/images/larm-rmah-AEaTUnvneik-unsplash.jpg"
];

export function Gallery() {
  return (
    <section id="gallery" className="py-16 bg-[#111] border-b border-[#222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-heading text-3xl md:text-5xl text-white mb-4"
            >
              Moments of Hope
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base text-gray-400 font-light"
            >
              A glimpse into the lives we touch and the smiles we help create every single day.
            </motion.p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {photos.map((photo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative overflow-hidden w-full"
            >
              <div className="aspect-[4/5] w-full">
                <img 
                  src={photo} 
                  alt={`Gallery image ${i + 1}`} 
                  className="w-full h-full object-cover transition-all duration-700"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
