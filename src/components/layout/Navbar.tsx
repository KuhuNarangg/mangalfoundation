"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";

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
    ["rgba(255, 255, 255, 1)", "rgba(0, 0, 0, 1)"]
  );

  const backdropFilter = useTransform(
    scrollY,
    [0, 100],
    ["blur(0px)", "blur(10px)"]
  );

  const boxShadow = useTransform(
    scrollY,
    [0, 100],
    ["none", "0 4px 6px -1px rgba(0, 0, 0, 0.05)"]
  );

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Our Causes", href: "#causes" },
    { name: "Impact", href: "#impact" },
    { name: "Gallery", href: "#gallery" },
    { name: "Contact", href: "#contact" },
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
          <motion.div style={{ color: textColor }} className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-heading font-bold text-2xl tracking-wider">
              MGF.
            </Link>
          </motion.div>
          
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
            <motion.div style={{ color: textColor }}>
              <Link
                href="#donate"
                className="inline-flex items-center justify-center px-6 py-2 border border-current rounded-full text-sm font-medium hover:bg-foreground hover:text-background transition-colors duration-300"
              >
                Donate
              </Link>
            </motion.div>
          </div>

          <div className="md:hidden flex items-center">
            <motion.button
              style={{ color: textColor }}
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none"
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
            <Link
              href="#donate"
              className="block w-full text-center mt-4 px-3 py-3 text-base font-medium text-white bg-black hover:bg-gray-800 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Donate
            </Link>
          </div>
        </div>
      )}
    </motion.nav>
  );
}
