"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function DonateHero() {
  return (
    <section className="bg-charcoal pt-40 pb-20 md:pt-56 md:pb-32 relative overflow-hidden">
      
      {/* Beautiful Picture Background */}
      <div className="absolute inset-0 bg-[url('/images/col1.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-black/60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
        
        <motion.nav
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-gray-300 text-xs tracking-[0.2em] uppercase mb-12 font-medium"
        >
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white">Donate</span>
        </motion.nav>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-heading text-5xl md:text-7xl lg:text-[6rem] text-white leading-[1.05] tracking-tight mb-8 max-w-5xl"
        >
          Your kindness can <br className="hidden md:block"/> change tomorrow.
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-200 font-light max-w-2xl mx-auto leading-relaxed"
        >
          By supporting the Mangal Guruji Foundation, you are directly funding education, feeding families, and empowering communities to build a self-reliant future.
        </motion.p>

      </div>
    </section>
  );
}
