"use client";

import { motion } from "framer-motion";
import { HandHeart, MousePointerClick, CheckCircle, Award, Sparkles } from "lucide-react";

const steps = [
  {
    title: "Choose a Cause",
    description: "Browse our active donation categories.",
    icon: MousePointerClick,
  },
  {
    title: "Select Contribution",
    description: "Decide how much impact you want to make.",
    icon: HandHeart,
  },
  {
    title: "Complete Donation",
    description: "Secure payment gateway (Coming Soon).",
    icon: CheckCircle,
  },
  {
    title: "Get Certificate",
    description: "Receive your 80G tax exemption receipt.",
    icon: Award,
  },
  {
    title: "Transform Lives",
    description: "Watch your contribution change the world.",
    icon: Sparkles,
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-white border-b border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-4xl md:text-5xl text-charcoal mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-light"
          >
            A simple transparent process from your heart to theirs.
          </motion.p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-gray-200 -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex flex-col items-center text-center bg-white p-6"
              >
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-white">
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">
                  Step 0{index + 1}
                </div>
                <h3 className="font-heading text-xl text-charcoal mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm font-light">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
