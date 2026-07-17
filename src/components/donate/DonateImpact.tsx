"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const impactStats = [
  { label: "Meals Served", value: 125000, suffix: "+" },
  { label: "Families Helped", value: 8500, suffix: "+" },
  { label: "Clothes Distributed", value: 45000, suffix: "+" },
  { label: "Active Volunteers", value: 350, suffix: "+" },
];

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
    <div ref={ref} className="font-heading text-5xl md:text-6xl lg:text-7xl mb-2 text-white leading-none tracking-tighter">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

export function DonateImpact() {
  return (
    <section className="py-24 bg-black border-y border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-gray-800 pb-8 gap-8">
          <h2 className="font-heading text-4xl md:text-5xl text-white">Your Donations at Work</h2>
          <p className="text-gray-400 font-light max-w-sm text-right hidden md:block">
            Numbers that represent actual human lives changed for the better.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {impactStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="flex flex-col items-center md:items-start text-center md:text-left"
            >
              <Counter value={stat.value} suffix={stat.suffix} />
              <div className="text-xs md:text-sm text-gray-500 uppercase tracking-widest font-light mt-3">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
