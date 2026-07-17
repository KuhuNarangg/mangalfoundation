"use client";

import { motion } from "framer-motion";

export function FinalCTA() {
  return (
    <section className="py-32 bg-black text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/yannis-h-uaPaEM7MiQQ-unsplash.jpg')] bg-cover bg-center grayscale-0 md:grayscale opacity-20" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-5xl md:text-7xl text-white mb-8 leading-tight"
        >
          Together, We Can Bring Hope to Every Home.
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto"
        >
          A single act of kindness can send ripples across a community. Be the reason someone smiles today.
        </motion.p>
        
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-white text-black py-5 px-12 font-bold uppercase tracking-[0.2em] text-sm hover:bg-gray-200 transition-colors shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          disabled
        >
          Donate Now (Coming Soon)
        </motion.button>
      </div>
    </section>
  );
}
