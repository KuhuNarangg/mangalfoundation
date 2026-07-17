"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function DonateHero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[url('/images/joel-muniz-qvzjG2pF4bE-unsplash.jpg')] bg-cover bg-center opacity-40 grayscale mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-white" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center mt-12">
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-gray-300 text-sm tracking-widest uppercase mb-12"
        >
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white font-bold">Donate</span>
        </motion.nav>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-heading text-5xl md:text-7xl lg:text-8xl text-white font-bold leading-tight mb-8 drop-shadow-2xl max-w-4xl"
        >
          Your Kindness Can Change Someone&apos;s Tomorrow.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-2xl text-gray-200 font-light max-w-2xl mx-auto drop-shadow-md"
        >
          By supporting the Mangal Guruji Foundation, you are directly funding education, feeding families, and empowering communities to build a self-reliant future.
        </motion.p>
      </div>
    </section>
  );
}
