"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Paintbrush } from "lucide-react";
import { DonateButton } from "@/components/DonateButton";

export function Hero() {
  const [isColored, setIsColored] = useState(false);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden flex items-center justify-center">
      {/* Color Background Image (Behind) */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/col1.jpg')" }}
        animate={{ opacity: isColored ? 1 : 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* Black and White version of the same image (Front) */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-10 grayscale"
        style={{ backgroundImage: "url('/images/col1.jpg')" }}
        animate={{ opacity: isColored ? 0 : 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/40 z-20 transition-opacity duration-1000" />

      {/* Content Container */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4">
        
        <AnimatePresence mode="wait">
          {!isColored ? (
            /* Initial Hero Content (Black and White State) */
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="w-16 h-16 md:w-20 md:h-20 border-2 border-white rounded-full flex items-center justify-center mb-6 shadow-lg"
              >
                <span className="font-heading font-bold text-xl md:text-2xl text-white">MGF.</span>
              </motion.div>

              <p className="text-lg md:text-2xl text-white/90 font-medium tracking-widest uppercase mb-4 drop-shadow-md">
                Mangal Guruji Foundation
              </p>

              <h1 className="font-heading text-6xl md:text-8xl lg:text-[10rem] text-white font-extrabold tracking-tighter leading-none mb-10 drop-shadow-2xl">
                Color the lives
              </h1>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => setIsColored(true)}
                  className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-transparent border-2 border-white rounded-full hover:bg-white hover:text-black overflow-hidden"
                >
                  <span className="mr-2 tracking-widest uppercase">Color The Lives</span>
                  <Paintbrush className="w-5 h-5 transition-transform group-hover:rotate-12" />
                </button>
                <DonateButton size="lg">Donate Now</DonateButton>
              </div>
            </motion.div>
          ) : (
            /* Secondary Content (Colored State) */
            <motion.div
              key="colored"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="flex flex-col items-center justify-center text-center pt-10"
            >
              <h2 className="font-heading text-5xl md:text-7xl lg:text-8xl text-white font-bold mb-10 drop-shadow-2xl leading-tight">
                Bring hope to those <br className="hidden md:block" /> who need it most.
              </h2>
              
              <Link
                href="/donate"
                className="bg-white text-black px-10 py-5 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform duration-300 shadow-2xl"
              >
                Donate Now
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll Indicator (Only show if colored so they know to scroll down) */}
        <AnimatePresence>
          {isColored && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <ChevronDown className="text-white w-8 h-8 opacity-70" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

