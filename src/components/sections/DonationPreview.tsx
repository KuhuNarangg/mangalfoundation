"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const donationTypes = [
  {
    title: "Food Donation",
    description: "Sponsor meals and help feed families facing hunger daily.",
    image: "/images/larm-rmah-AEaTUnvneik-unsplash.jpg",
  },
  {
    title: "Clothes Donation",
    description: "Donate winter clothes and essentials to protect people from harsh weather.",
    image: "/images/nico-smit-NFoerQuvzrs-unsplash.jpg",
  },
  {
    title: "Women Empowerment",
    description: "Support education and skill development for women to become self-reliant.",
    image: "/images/srimathi-jayaprakash-uO1MUMn0Xzc-unsplash.jpg",
  }
];

export function DonationPreview() {
  return (
    <section className="py-20 bg-white border-b border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <div className="max-w-xl">
            <motion.h2
              className="font-heading text-3xl md:text-5xl text-charcoal mb-4 leading-tight"
            >
              How Would You Like to Make a Difference?
            </motion.h2>
            <motion.p
              transition={{ delay: 0.2 }}
              className="text-gray-500 font-light text-sm md:text-base"
            >
              Every contribution, no matter how small, helps transform lives. Choose a cause close to your heart and start creating a positive impact today.
            </motion.p>
          </div>
          <motion.div
            className="hidden md:block"
          >
            <Link 
              href="/donate"
              className="inline-flex items-center text-charcoal font-bold uppercase tracking-[0.2em] text-xs border-b border-charcoal pb-1 hover:text-black transition-colors"
            >
              Explore All Programs
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {donationTypes.map((type, index) => (
            <Link href="/donate" key={type.title} className="block">
              <motion.div
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group relative aspect-[4/5] overflow-hidden bg-gray-100 h-full w-full"
              >
              <Image
                src={type.image}
                alt={type.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-90 md:opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
              
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <h3 className="text-white font-heading text-2xl md:text-3xl mb-2">
                  {type.title}
                </h3>
                
                <div className="h-auto opacity-100 md:h-0 md:opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                  <p className="text-gray-300 font-light text-sm mb-6 leading-relaxed">
                    {type.description}
                  </p>
                </div>

                <div className="transform translate-y-0 opacity-100 md:translate-y-4 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                  <span 
                    className="inline-block bg-white text-black py-3 px-8 text-xs font-bold uppercase tracking-[0.2em] group-hover:bg-gray-200 transition-colors"
                  >
                    Donate Now
                  </span>
                </div>
              </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Mobile Link */}
        <div className="mt-8 text-center md:hidden">
          <Link 
            href="/donate"
            className="inline-flex items-center text-charcoal font-bold uppercase tracking-[0.2em] text-xs border-b border-charcoal pb-1 hover:text-black transition-colors"
          >
            Explore All Programs
          </Link>
        </div>

      </div>
    </section>
  );
}
