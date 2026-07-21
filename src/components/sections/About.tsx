"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function About() {
  return (
    <section id="about" className="py-24 md:py-32 bg-beige-light text-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-sm font-bold tracking-widest text-charcoal-light uppercase mb-4">About The Founder</h2>
              <h3 className="font-heading text-4xl md:text-5xl lg:text-6xl leading-tight text-charcoal">
                Aditya Vikram Singh
              </h3>
            </div>
            
            <div className="prose prose-lg text-charcoal-light">
              <p className="font-light leading-relaxed">
                At the age of 28, Aditya Vikram Singh reflects on his life as a journey filled with struggles, perseverance, and valuable life lessons. Growing up in an ordinary middle-class family, he experienced both hardships and opportunities that shaped his perspective on life.
              </p>
              <p className="font-light leading-relaxed mt-4">
                Through personal challenges, he developed a strong belief that success should not only benefit oneself but should also be used to uplift others. His greatest aspiration is to ensure that future generations receive quality education, strong values, and proper mentorship.
              </p>
            </div>

            <blockquote className="pl-6 border-l-2 border-charcoal mt-8">
              <p className="font-heading text-xl md:text-2xl font-medium italic text-charcoal">
                "A person’s greatest identity is not their achievements, but the positive impact they create in society."
              </p>
            </blockquote>
          </motion.div>

          <motion.div
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full aspect-[4/5] bg-beige-dark rounded-xl overflow-hidden shadow-sm">
              <Image
                src="/images/founder.jpg"
                alt="Aditya Vikram Singh, Founder of Mangal Guruji Foundation"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top"
              />
            </div>
            
            <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-xl shadow-xl max-w-sm border border-beige-dark hidden md:block">
              <h4 className="font-heading text-2xl font-semibold text-charcoal mb-3">His Commitment</h4>
              <p className="text-charcoal-light font-light text-sm leading-relaxed">
                To build a system that provides quality education, proper guidance, skill development, and equal opportunities for children, youth, women, and rural communities.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
