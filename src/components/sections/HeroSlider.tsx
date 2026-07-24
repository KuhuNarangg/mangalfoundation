"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { DonateButton } from "@/components/DonateButton";

const images = [
  "/images/larm-rmah-AEaTUnvneik-unsplash.jpg",
  "/images/nico-smit-NFoerQuvzrs-unsplash.jpg",
  "/images/srimathi-jayaprakash-uO1MUMn0Xzc-unsplash.jpg"
];

export function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={images[currentIndex]}
            alt="Hero Background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-4xl"
        >
          <span className="mb-4 block text-sm font-bold uppercase tracking-[0.3em] text-white/80">
            Mangal Guruji Foundation
          </span>
          <h1 className="mb-6 font-heading text-5xl font-bold leading-tight text-white md:text-7xl">
            Empowering Lives, <br />
            Creating Hope
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg font-light text-white/90 md:text-xl">
            Join us in our mission to bring light to the darkest corners. 
            Your support can change a life forever.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <DonateButton className="px-8 py-4 text-lg">Donate Now</DonateButton>
            <Link
              href="/volunteer#apply"
              className="rounded-full border-2 border-white px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-black"
            >
              Become a Volunteer
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
