"use client";

import { motion } from "framer-motion";
import { DonateButton } from "@/components/DonateButton";

export function FinalCTA() {
  return (
    <section className="py-32 bg-black text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/yannis-h-uaPaEM7MiQQ-unsplash.jpg')] bg-cover bg-center grayscale-0 md:grayscale opacity-20" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.h2
          className="font-heading text-5xl md:text-7xl text-white mb-8 leading-tight"
        >
          Together, We Can Bring Hope to Every Home.
        </motion.h2>
        
        <motion.p
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto"
        >
          A single act of kindness can send ripples across a community. Be the reason someone smiles today.
        </motion.p>
        
        <DonateButton size="lg">Donate Now</DonateButton>
      </div>
    </section>
  );
}
