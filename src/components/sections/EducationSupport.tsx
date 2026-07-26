"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Shirt, GraduationCap, Laptop, MonitorPlay, Presentation, CheckCircle2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    title: "Books, Notebooks & Stationery Support",
    amount: "₹500 – ₹1,000",
    icon: BookOpen,
    color: "from-blue-500 to-cyan-400",
    shadow: "shadow-blue-500/20",
    items: [
      "School notebooks",
      "Textbooks and learning materials",
      "Pens, pencils, and stationery kits",
    ],
    footer: "Every child deserves the tools to learn and succeed.",
  },
  {
    title: "School Uniform Support",
    amount: "₹1,500",
    icon: Shirt,
    color: "from-rose-500 to-pink-500",
    shadow: "shadow-rose-500/20",
    items: [
      "School uniforms",
      "Shoes and socks",
      "Essential clothing for students",
    ],
    footer: "Give a child the confidence to attend school with dignity.",
  },
  {
    title: "Student Education & School Fees",
    amount: "₹5,000",
    icon: GraduationCap,
    color: "from-amber-500 to-orange-400",
    shadow: "shadow-amber-500/20",
    items: [
      "School tuition fees",
      "Examination fees",
      "Educational assistance programs",
    ],
    footer: "Keep a child in school and help build a brighter future.",
  },
  {
    title: "Digital Education & Computer Training",
    amount: "₹15,000",
    icon: Laptop,
    color: "from-emerald-500 to-teal-400",
    shadow: "shadow-emerald-500/20",
    items: [
      "Computer-based learning",
      "AI and technology education",
      "Digital literacy programs",
    ],
    footer: "Prepare children for the future through technology.",
  },
  {
    title: "Computer Library Development",
    amount: "₹50,000",
    icon: MonitorPlay,
    color: "from-purple-500 to-indigo-400",
    shadow: "shadow-purple-500/20",
    items: [
      "Computer systems",
      "Internet connectivity",
      "Digital learning resources",
      "Community computer library",
    ],
    footer: "Create opportunities for hundreds of students through digital access.",
  },
  {
    title: "School Digitalization Initiative",
    amount: "₹100,000",
    icon: Presentation,
    color: "from-rose-600 to-orange-500",
    shadow: "shadow-orange-500/20",
    items: [
      "Smart classrooms",
      "Projectors and digital screens",
      "E-learning infrastructure",
      "AI-enabled educational resources",
    ],
    footer: "Bring modern technology into schools and empower future generations.",
  },
];

const IN_KIND = [
  "Books and educational materials",
  "Notebooks and stationery",
  "School bags",
  "School uniforms and clothing",
  "Computers and digital devices",
  "Educational resources and equipment",
];

export function EducationSupport() {
  return (
    <section className="py-20 bg-beige-light border-y border-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-3xl md:text-4xl text-charcoal mb-4 leading-tight">
              Support a Child, Transform a Future
            </h2>
            <p className="text-lg md:text-xl text-charcoal-light font-light">
              Your contribution can change a child's life. Choose a tier to support education and digital literacy across rural India.
            </p>
          </motion.div>
        </div>

        {/* Compact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {TIERS.map((tier, idx) => (
            <motion.div
              key={tier.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              {/* Card Header (Compact) */}
              <div className={cn("p-5 text-white bg-gradient-to-br relative flex items-center gap-4", tier.color)}>
                <div className="bg-white/20 p-3 rounded-xl">
                  <tier.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight mb-1">
                    {tier.title}
                  </h3>
                  <div className="text-lg font-bold tracking-tight">
                    {tier.amount}
                  </div>
                </div>
              </div>

              {/* Card Body (Compact List) */}
              <div className="p-5 flex flex-col flex-grow bg-white">
                <ul className="space-y-2.5 mb-6 flex-grow">
                  {tier.items.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-xs leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/donate"
                  className={cn(
                    "block w-full text-center py-2.5 rounded-xl text-white font-bold uppercase text-xs transition-all hover:-translate-y-0.5 hover:shadow-md",
                    tier.color
                  )}
                >
                  Donate Now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Other Ways & Mission Section */}
        <div className="bg-charcoal rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-[url('/images/col1.jpg')] bg-cover bg-center opacity-10" />
          
          <div className="relative grid grid-cols-1 md:grid-cols-2 p-8 md:p-16 gap-12 items-center">
            
            {/* In Kind */}
            <div>
              <div className="inline-flex items-center gap-2 text-rose-400 font-bold uppercase tracking-[0.2em] text-xs mb-4">
                <Heart className="w-4 h-4" /> Other Ways to Contribute
              </div>
              <h3 className="font-heading text-3xl text-white mb-8 leading-tight">
                You can also donate in-kind resources
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                {IN_KIND.map((item, idx) => (
                  <li key={idx} className="flex items-center text-gray-300 text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link 
                  href="/contact"
                  className="inline-flex items-center text-white border-b border-rose-500 pb-1 hover:text-rose-400 transition-colors uppercase tracking-widest text-xs font-bold"
                >
                  Contact us to donate items
                </Link>
              </div>
            </div>

            {/* Mission */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center">
              <h3 className="font-heading text-2xl text-white mb-6">Our Mission</h3>
              
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {["Education", "Women Empowerment", "Digital Literacy", "Rural Development"].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-rose-300 text-xs uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-xl font-heading text-white italic mb-8 leading-relaxed">
                "A small donation today can create a lifetime of opportunities for a child."
              </p>

              <div className="pt-8 border-t border-white/10">
                <p className="text-white font-bold tracking-widest uppercase text-sm mb-2">
                  Mangal Guruji Foundation
                </p>
                <p className="text-gray-400 text-sm font-light">
                  Together, let's build an educated, empowered, and digitally enabled India.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
