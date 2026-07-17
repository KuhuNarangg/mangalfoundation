"use client";

import { motion } from "framer-motion";

export function Testimonials() {
  return (
    <section className="bg-white text-charcoal relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        
        {/* Left Side: Massive Image */}
        <div className="relative h-[50vh] lg:h-auto overflow-hidden">
          <img 
            src="/images/adrien-taylor-o4m8M9ri6wc-unsplash.jpg" 
            alt="Impact" 
            className="absolute inset-0 w-full h-full object-cover grayscale-0 md:grayscale"
          />
        </div>

        {/* Right Side: Content */}
        <div className="flex flex-col justify-center p-12 md:p-24 lg:p-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <span className="text-sand text-[10rem] font-heading leading-none opacity-30 absolute top-12 left-12 md:top-24 md:left-24">"</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative z-10"
          >
            <p className="font-heading text-4xl md:text-5xl lg:text-6xl font-medium leading-tight mb-16 text-charcoal">
              Education is the best investment. If you have knowledge, you can achieve anything.
            </p>
            <div className="inline-block border-l-4 border-charcoal pl-6">
              <p className="font-bold uppercase tracking-[0.2em] text-sm md:text-base text-charcoal">Aditya Vikram Singh</p>
              <p className="text-gray-500 text-sm mt-2 font-light tracking-widest uppercase">Founder & Social Worker</p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
