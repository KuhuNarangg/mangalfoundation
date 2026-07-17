"use client";

import { motion } from "framer-motion";
import { Utensils, Shirt, GraduationCap } from "lucide-react";

const categories = [
  {
    title: "Food Donation",
    icon: Utensils,
    description: "Millions sleep hungry every night. Your contribution can provide nutritious meals to families who struggle to afford their daily bread.",
    impact: "Provides 1 complete healthy meal per $5",
    options: ["Sponsor 1 Meal", "Sponsor 5 Meals", "Sponsor 10 Meals", "Custom Amount"],
    image: "/images/larm-rmah-AEaTUnvneik-unsplash.jpg"
  },
  {
    title: "Clothes Donation",
    icon: Shirt,
    description: "A piece of clothing that lies unused in your wardrobe can protect someone from harsh winters and restore their dignity.",
    impact: "Provides 1 winter clothing kit per $15",
    options: ["1 Clothing Kit", "5 Clothing Kits", "Family Bundle", "Custom Amount"],
    image: "/images/nico-smit-NFoerQuvzrs-unsplash.jpg"
  },
  {
    title: "Women Empowerment",
    icon: GraduationCap,
    description: "When you empower a woman, you empower an entire generation. Help us provide skill development and education to women.",
    impact: "Funds 1 month of vocational training per $30",
    options: ["1 Month Training", "6 Months Training", "Full Year Support", "Custom Amount"],
    image: "/images/srimathi-jayaprakash-uO1MUMn0Xzc-unsplash.jpg"
  }
];

export function DonateCategories() {
  return (
    <section className="py-24 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="space-y-32">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className={`flex flex-col lg:flex-row gap-16 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
            >
              
              {/* Image Side */}
              <div className="w-full lg:w-1/2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-none border border-gray-100 shadow-xl group">
                  <img 
                    src={category.image} 
                    alt={category.title} 
                    className="absolute inset-0 w-full h-full object-cover grayscale-0 md:grayscale transition-all duration-700 md:group-hover:grayscale-0 md:group-hover:scale-105"
                  />
                  <div className="absolute top-6 left-6 bg-white p-4 rounded-full shadow-lg">
                    <category.icon className="w-8 h-8 text-black" />
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center">
                <h2 className="font-heading text-4xl md:text-5xl text-charcoal mb-6">{category.title}</h2>
                <p className="text-gray-600 font-light text-lg mb-8 leading-relaxed">
                  {category.description}
                </p>
                <div className="bg-gray-50 border-l-4 border-black p-6 mb-8">
                  <p className="font-bold tracking-widest uppercase text-sm text-black">Impact</p>
                  <p className="text-gray-600 font-light mt-1">{category.impact}</p>
                </div>
                
                <h3 className="font-bold uppercase tracking-[0.2em] text-xs text-gray-500 mb-4">Select Contribution</h3>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {category.options.map((opt, i) => (
                    <button 
                      key={i}
                      className="border border-gray-300 py-4 px-2 text-sm font-medium text-gray-700 hover:border-black hover:bg-black hover:text-white transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                
                <button className="bg-charcoal text-white py-5 px-10 w-full md:w-auto self-start font-bold uppercase tracking-[0.2em] text-sm hover:bg-black transition-colors shadow-lg">
                  Proceed to Donate
                </button>
              </div>

            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
