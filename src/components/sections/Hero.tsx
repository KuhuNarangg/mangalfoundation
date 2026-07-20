"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  // offset: ["start start", "end end"] ensures scrollYProgress reaches 1.0 EXACTLY 
  // when the sticky container unpins (when the bottom of the container hits the bottom of the viewport).
  // This solves the bug where the website would scroll away before the color fully changed!
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Mapping to [0, 0.6] inside a 200vh container.
  // This means the animation finishes in the first ~60vh (your first scroll).
  // The remaining ~40vh requires your second scroll to escape the container.
  // This eliminates the 2-3 extra scrolls while still giving you the 2-step process!
  const bwOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const colorOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  // First text fades out synchronously with the B&W image
  const text1Opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const text1Y = useTransform(scrollYProgress, [0, 0.6], [0, -50]);

  // Second text fades in synchronously with the Color image
  const text2Opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const text2Y = useTransform(scrollYProgress, [0, 0.6], [50, 0]);

  // h-[200dvh] means the user scrolls exactly 100dvh to unpin the container.
  return (
    <div ref={containerRef} className="relative h-[200dvh]">
      {/* Sticky container to hold the images and text while scrolling */}
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden flex items-center justify-center">

        {/* Color Background Image (Behind) */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/col1.jpg')",
            opacity: colorOpacity,
            willChange: "opacity"
          }}
        />

        {/* Black and White version of the same image (Front) */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-10 grayscale"
          style={{
            backgroundImage: "url('/images/col1.jpg')",
            opacity: bwOpacity,
            willChange: "opacity"
          }}
        />

        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/30 z-20" />

        {/* Initial Hero Content */}
        <motion.div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4"
          style={{ opacity: text1Opacity, y: text1Y }}
        >
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-16 h-16 md:w-20 md:h-20 border-2 border-white rounded-full flex items-center justify-center mb-6"
          >
            <span className="font-heading font-bold text-xl md:text-2xl text-white">MGF.</span>
          </motion.div>

          <motion.p
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-2xl text-white/90 font-medium tracking-widest uppercase mb-4 text-center"
          >
            Mangal Guruji Foundation
          </motion.p>

          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="font-heading text-6xl md:text-8xl lg:text-[10rem] text-white font-extrabold tracking-tighter leading-none mb-6 drop-shadow-lg text-center"
          >
            Color the lives
          </motion.h1>

          <motion.p
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-sm md:text-base text-white/80 uppercase tracking-[0.3em] mt-4"
          >
            Scroll now
          </motion.p>
        </motion.div>

        {/* Secondary Content that appears after scrolling */}
        <motion.div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 pt-32 md:pt-48"
          style={{
            opacity: text2Opacity,
            y: text2Y,
            pointerEvents: useTransform(text2Opacity, v => v > 0 ? "auto" : "none") as any
          }}
        >
          <h2 className="font-heading text-5xl md:text-7xl lg:text-8xl text-white font-bold mb-8 text-center drop-shadow-md leading-tight">
            Bring hope to those <br className="hidden md:block" /> who need it most.
          </h2>
          <Link
            href="/donate"
            className="bg-charcoal text-white px-8 py-4 rounded-md font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-lg"
          >
            Donate Now
          </Link>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center"
          style={{ opacity: text1Opacity }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown className="text-white w-8 h-8 opacity-70" />
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
