"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { useContent } from "@/components/ContentProvider";

export function Footer() {
  const content = useContent();
  const socials = content.socials || { facebook: "", instagram: "", twitter: "" };
  const email = content.contact.email || siteConfig.email;

  return (
    <footer className="bg-foreground text-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
        <div className="col-span-1 sm:col-span-2 md:col-span-1">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <Image
              src="/images/logo.png"
              alt="Mangal Guruji Foundation"
              width={56}
              height={56}
              className="h-14 w-14 rounded-lg object-contain bg-white p-1"
            />
            <span className="font-heading font-bold text-xl tracking-wide leading-tight text-background">
              Mangal Guruji
              <span className="block text-[0.6rem] font-sans font-semibold tracking-[0.2em] uppercase opacity-70">
                Foundation
              </span>
            </span>
          </Link>
          <p className="text-sm text-gray-400 mt-4 max-w-xs leading-relaxed">
            {content.footer.description}
          </p>
          <div className="flex space-x-4 mt-6">
            {socials.facebook && (
              <a href={socials.facebook} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            )}
            {socials.twitter && (
              <a href={socials.twitter} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
            )}
            {socials.instagram && (
              <a href={socials.instagram} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-3">
            <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</Link></li>
            <li><Link href="/causes" className="text-gray-400 hover:text-white transition-colors text-sm">Our Causes</Link></li>
            <li><Link href="/impact" className="text-gray-400 hover:text-white transition-colors text-sm">Our Impact</Link></li>
            <li><Link href="/gallery" className="text-gray-400 hover:text-white transition-colors text-sm">Gallery</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4">Support</h3>
          <ul className="space-y-3">
            <li><Link href="/donate" className="text-gray-400 hover:text-white transition-colors text-sm">Donate Now</Link></li>
            <li><Link href="/volunteer" className="text-gray-400 hover:text-white transition-colors text-sm">Volunteer</Link></li>
            <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Partner With Us</Link></li>
            <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4">Contact Info</h3>
          <ul className="space-y-4">
            {content.contact.address && (
              <li className="flex items-start">
                <MapPin size={18} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">{content.contact.address}</span>
              </li>
            )}
            {content.contact.phone && (
              <li className="flex items-start">
                <Phone size={18} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col space-y-1">
                  {content.contact.phone.split(',').map((p, i) => (
                    <a key={i} href={`tel:${p.replace(/\s/g, "")}`} className="text-gray-400 text-sm hover:text-white transition-colors">
                      {p.trim()}
                    </a>
                  ))}
                </div>
              </li>
            )}
            <li className="flex items-center">
              <Mail size={18} className="text-gray-400 mr-3 flex-shrink-0" />
              <a href={`mailto:${email}`} className="text-gray-400 text-sm hover:text-white transition-colors break-all">{email}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 text-sm text-center md:text-left">
          © {new Date().getFullYear()} Mangal Guruji Foundation. All rights reserved.
        </p>
        <div className="flex space-x-6 text-sm text-gray-500">
          <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  );
}
