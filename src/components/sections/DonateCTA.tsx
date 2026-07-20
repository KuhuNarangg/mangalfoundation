"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function DonateCTA() {
  return (
    <section id="donate" className="relative py-48 md:py-64 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/yannis-h-uaPaEM7MiQQ-unsplash.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-black/70 mix-blend-multiply" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center justify-center h-full">
        <motion.div
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-heading text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight">
            Become a Catalyst for Change
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 font-light mb-12 max-w-3xl mx-auto">
            Your contribution directly funds education, healthcare, and empowerment programs. Let's create a positive impact that outlives us.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/donate" className="bg-white text-charcoal px-12 py-5 rounded-none font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors">
              Donate Now
            </Link>
            <Link href="/contact" className="bg-transparent border border-white text-white px-12 py-5 rounded-none font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-charcoal transition-colors">
              Volunteer
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
