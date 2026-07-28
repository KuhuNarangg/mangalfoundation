"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface CategoryMarqueeProps {
  images: string[];
}

export function CategoryMarquee({ images }: CategoryMarqueeProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className="relative overflow-hidden bg-white/5 py-4 border-y border-white/10 my-8">
      <div className="flex w-full overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap gap-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 20, // Adjust speed here
          }}
        >
          {/* Duplicate the images array to create a seamless loop */}
          {[...images, ...images].map((src, index) => (
            <div
              key={index}
              className="relative w-64 h-40 md:w-80 md:h-48 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border-2 border-white/20"
            >
              <Image
                src={src}
                alt="Category picture"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 256px, 320px"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
