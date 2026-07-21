"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const causes = [
  {
    title: "Education",
    description: "Provide quality education, career guidance, and skill development to underprivileged, poor, and marginalized communities.",
    image: "/images/larm-rmah-AEaTUnvneik-unsplash.jpg",
  },
  {
    title: "Healthcare",
    description: "Improve public health through health awareness programs, medical assistance, healthcare camps, and preventive initiatives.",
    image: "/images/yannis-h-uaPaEM7MiQQ-unsplash.jpg",
  },
  {
    title: "Women & Elderly",
    description: "Organize programs that support children, women, and senior citizens by improving their education, safety, health, and well-being.",
    image: "/images/srimathi-jayaprakash-uO1MUMn0Xzc-unsplash.jpg",
  },
  {
    title: "Empowerment",
    description: "Help individuals become self-reliant, skilled, confident, and financially independent while enabling them to live with dignity.",
    image: "/images/varun-gaba-O_H7BlvtZ8Y-unsplash.jpg",
  },
  {
    title: "Environment",
    description: "Promote environmental conservation, cleanliness, tree plantation, social unity, national integration, and community development.",
    image: "/images/col1.jpg",
  },
  {
    title: "Humanitarian Service",
    description: "Work continuously for the holistic development of society through the values of service, compassion, dedication, and humanity.",
    image: "/images/larm-rmah-AEaTUnvneik-unsplash.jpg",
  }
];

export function OurCauses() {
  return (
    <section id="causes" className="py-12 bg-beige text-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <motion.h2
            className="font-heading text-3xl md:text-4xl lg:text-5xl mb-4 text-charcoal"
          >
            Our Mission
          </motion.h2>
          <motion.p
            transition={{ delay: 0.2 }}
            className="text-base text-charcoal-light max-w-3xl mx-auto font-light"
          >
            The foundation dreams of creating a society where no one is left behind because of poverty, illiteracy, or lack of resources. We are committed to six core pillars of social change.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {causes.map((cause, index) => (
            <motion.div
              key={cause.title}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group bg-beige-light rounded-lg overflow-hidden shadow-sm border border-sand hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <div className="relative w-full aspect-video overflow-hidden bg-sand">
                <Image
                  src={cause.image}
                  alt={cause.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <div className="p-5 flex-grow">
                <h3 className="font-heading text-xl mb-2 text-charcoal">
                  {cause.title}
                </h3>
                <p className="text-charcoal-light font-light leading-snug text-xs md:text-sm">
                  {cause.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
