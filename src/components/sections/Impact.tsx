"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useContent } from "@/components/ContentProvider";

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = value / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="font-heading text-4xl md:text-5xl lg:text-6xl mb-1 text-white leading-none tracking-tighter">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

export function Impact() {
  const content = useContent();
  return (
    <section id="impact" className="py-16 relative bg-black border-y border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-neutral-800 pb-6">
          <h2 className="font-heading text-2xl md:text-3xl text-white">{content.impact.heading}</h2>
          <p className="text-neutral-400 text-sm font-light max-w-sm italic">
            &ldquo;{content.impact.quote}&rdquo;
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6">
          {content.impact.stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="flex flex-col items-center text-center"
            >
              <Counter value={stat.value} suffix={stat.suffix} />
              <div className="text-xs md:text-sm text-neutral-400 uppercase tracking-widest font-light mt-2">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
