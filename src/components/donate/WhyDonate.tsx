"use client";

import { motion } from "framer-motion";
import { ShieldCheck, HeartHandshake, Eye, LineChart } from "lucide-react";

const reasons = [
  {
    title: "100% Transparent",
    description: "Every dollar you donate is tracked and documented. We believe in absolute financial transparency.",
    icon: Eye,
  },
  {
    title: "Direct Community Impact",
    description: "We work directly on the ground. Your money bypasses middlemen and reaches those who need it most.",
    icon: LineChart,
  },
  {
    title: "Trusted NGO",
    description: "Registered and audited annually. We have built a legacy of trust with thousands of donors worldwide.",
    icon: ShieldCheck,
  },
  {
    title: "Every Contribution Matters",
    description: "Whether it&apos;s $5 or $500, every single contribution is treated with the same respect and urgency.",
    icon: HeartHandshake,
  }
];

export function WhyDonate() {
  return (
    <section className="py-24 bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            className="font-heading text-4xl md:text-5xl text-charcoal mb-4"
          >
            Why Donate With Us?
          </motion.h2>
          <motion.p
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-light max-w-2xl mx-auto"
          >
            We don&apos;t just ask for funds; we ask for your trust. Here is how we ensure your contribution creates maximum impact.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="bg-white p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center"
            >
              <div className="bg-gray-100 p-4 rounded-full mb-6">
                <reason.icon className="w-8 h-8 text-charcoal" />
              </div>
              <h3 className="font-heading text-xl mb-3 text-charcoal">{reason.title}</h3>
              <p className="text-gray-500 font-light text-sm leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
