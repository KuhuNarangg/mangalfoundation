"use client";

import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { DonateButton } from "@/components/DonateButton";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();

  // Change background and text color based on scroll position
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.9)"]
  );

  const textColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 1)", "rgba(17, 24, 39, 1)"]
  );

  const backdropFilter = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(10px)"]);

  const boxShadow = useTransform(
    scrollY,
    [0, 100],
    ["none", "0 4px 6px -1px rgba(0, 0, 0, 0.05)"]
  );

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Our Causes", href: "/causes" },
    { name: "Impact", href: "/impact" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <motion.nav
      style={{
        backgroundColor,
        backdropFilter,
        WebkitBackdropFilter: backdropFilter,
        boxShadow,
      }}
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex-shrink-0 flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Mangal Guruji Foundation"
              width={44}
              height={44}
              priority
              className="h-11 w-11 rounded-lg object-contain bg-white ring-1 ring-black/5 shadow-sm"
            />
            <motion.span
              style={{ color: textColor }}
              className="hidden sm:block font-heading font-bold text-lg tracking-wide leading-tight"
            >
              Mangal Guruji
              <span className="block text-[0.6rem] font-sans font-semibold tracking-[0.25em] uppercase opacity-80">
                Foundation
              </span>
            </motion.span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <motion.div key={link.name} style={{ color: textColor }}>
                <Link
                  href={link.href}
                  className="text-sm font-medium hover:opacity-70 transition-opacity"
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
            <DonateButton size="sm">Donate</DonateButton>
          </div>

          <div className="md:hidden flex items-center gap-3">
            <DonateButton size="sm" showIcon={false} className="px-4 py-2 text-xs">
              Donate
            </DonateButton>
            <motion.button
              style={{ color: textColor }}
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md absolute top-20 left-0 right-0 shadow-lg border-t border-gray-100">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3" onClick={() => setIsOpen(false)}>
              <DonateButton className="w-full">Donate Now</DonateButton>
            </div>
          </div>
        </div>
      )}
    </motion.nav>
  );
}
