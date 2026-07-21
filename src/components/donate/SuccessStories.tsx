"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const stories = [
  {
    quote: "Because of the foundation, my daughter is now attending school and has proper books to read.",
    author: "Ramesh K.",
    location: "Rural Village Beneficiary",
    image: "/images/adrien-taylor-o4m8M9ri6wc-unsplash.jpg"
  },
  {
    quote: "The winter clothing drive saved us during the coldest nights. We are forever grateful.",
    author: "Sunita M.",
    location: "Shelter Resident",
    image: "/images/joel-muniz-qvzjG2pF4bE-unsplash.jpg"
  }
];

export function SuccessStories() {
  return (
    <section className="py-24 bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            className="font-heading text-4xl md:text-5xl text-charcoal mb-4"
          >
            Real Stories of Impact
          </motion.h2>
          <motion.p
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-light max-w-2xl mx-auto"
          >
            These are the voices of the people whose lives were changed because someone like you chose to care.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {stories.map((story, index) => (
            <motion.div
              key={index}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="bg-white border border-gray-200 flex flex-col sm:flex-row overflow-hidden shadow-sm"
            >
              <div className="w-full sm:w-2/5 aspect-square sm:aspect-auto relative">
                <Image
                  src={story.image}
                  alt={story.author}
                  fill
                  sizes="(max-width: 640px) 100vw, 40vw"
                  className="object-cover grayscale-0 md:grayscale"
                />
              </div>
              <div className="w-full sm:w-3/5 p-8 flex flex-col justify-center relative">
                <span className="text-gray-100 text-6xl font-heading absolute top-4 left-4 -z-10">"</span>
                <p className="text-gray-700 font-medium italic mb-6 relative z-10 leading-relaxed">
                  "{story.quote}"
                </p>
                <div>
                  <h4 className="font-bold tracking-widest uppercase text-xs text-charcoal">{story.author}</h4>
                  <p className="text-gray-400 text-xs mt-1">{story.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
