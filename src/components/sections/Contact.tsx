"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { siteConfig } from "@/lib/site";
import { useContent } from "@/components/ContentProvider";

export function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const content = useContent();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
      
      // Reset success message after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  };

  return (
    <section id="contact" className="py-32 bg-sand text-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          <motion.div
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 flex flex-col justify-center"
          >
            <h2 className="font-heading text-6xl md:text-8xl text-charcoal mb-8 leading-none">{content.contact.heading}</h2>
            <p className="text-charcoal-light text-xl md:text-2xl font-light mb-16 max-w-lg">
              {content.contact.description}
            </p>

            <div className="space-y-12">
              {content.contact.address && (
                <div>
                  <h4 className="font-bold uppercase tracking-[0.2em] text-sm text-charcoal mb-2">Visit Us</h4>
                  <p className="text-charcoal-light font-light text-lg">{content.contact.address}</p>
                </div>
              )}

              <div>
                <h4 className="font-bold uppercase tracking-[0.2em] text-sm text-charcoal mb-2">Email Us</h4>
                <a href={`mailto:${content.contact.email || siteConfig.email}`} className="text-charcoal-light font-light text-lg hover:text-charcoal transition-colors border-b border-charcoal-light pb-1">
                  {content.contact.email || siteConfig.email}
                </a>
              </div>

              {content.contact.phone && (
                <div>
                  <h4 className="font-bold uppercase tracking-[0.2em] text-sm text-charcoal mb-2">Call Us</h4>
                  <a href={`tel:${content.contact.phone.replace(/\s/g, "")}`} className="text-charcoal-light font-light text-lg hover:text-charcoal transition-colors">{content.contact.phone}</a>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            transition={{ duration: 0.8 }}
            className="lg:w-1/2"
          >
            <form onSubmit={handleSubmit} className="h-full flex flex-col justify-center gap-12 relative">
              
              {status === "success" && (
                <div className="absolute -top-16 left-0 bg-green-50 text-green-800 p-4 w-full border-l-4 border-green-500 font-medium">
                  Thank you! Your message has been sent successfully.
                </div>
              )}

              {status === "error" && (
                <div className="absolute -top-16 left-0 bg-red-50 text-red-800 p-4 w-full border-l-4 border-red-500 font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="relative">
                <input 
                  type="text" 
                  id="name" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="peer w-full border-b border-charcoal-light/30 py-4 focus:outline-none focus:border-charcoal transition-colors bg-transparent text-charcoal text-xl placeholder-transparent" 
                  placeholder="Full Name" 
                />
                <label 
                  htmlFor="name" 
                  className="absolute left-0 -top-6 text-sm font-bold uppercase tracking-widest text-charcoal transition-all peer-placeholder-shown:text-xl peer-placeholder-shown:top-4 peer-placeholder-shown:font-light peer-placeholder-shown:text-charcoal-light peer-placeholder-shown:normal-case peer-focus:-top-6 peer-focus:text-sm peer-focus:font-bold peer-focus:uppercase peer-focus:text-charcoal cursor-text"
                >
                  Full Name
                </label>
              </div>

              <div className="relative">
                <input 
                  type="email" 
                  id="email" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="peer w-full border-b border-charcoal-light/30 py-4 focus:outline-none focus:border-charcoal transition-colors bg-transparent text-charcoal text-xl placeholder-transparent" 
                  placeholder="Email Address" 
                />
                <label 
                  htmlFor="email" 
                  className="absolute left-0 -top-6 text-sm font-bold uppercase tracking-widest text-charcoal transition-all peer-placeholder-shown:text-xl peer-placeholder-shown:top-4 peer-placeholder-shown:font-light peer-placeholder-shown:text-charcoal-light peer-placeholder-shown:normal-case peer-focus:-top-6 peer-focus:text-sm peer-focus:font-bold peer-focus:uppercase peer-focus:text-charcoal cursor-text"
                >
                  Email Address
                </label>
              </div>

              <div className="relative">
                <textarea 
                  id="message" 
                  rows={4} 
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="peer w-full border-b border-charcoal-light/30 py-4 focus:outline-none focus:border-charcoal transition-colors bg-transparent resize-none text-charcoal text-xl placeholder-transparent mt-4" 
                  placeholder="Your Message"
                ></textarea>
                <label 
                  htmlFor="message" 
                  className="absolute left-0 -top-2 text-sm font-bold uppercase tracking-widest text-charcoal transition-all peer-placeholder-shown:text-xl peer-placeholder-shown:top-8 peer-placeholder-shown:font-light peer-placeholder-shown:text-charcoal-light peer-placeholder-shown:normal-case peer-focus:-top-2 peer-focus:text-sm peer-focus:font-bold peer-focus:uppercase peer-focus:text-charcoal cursor-text"
                >
                  Your Message
                </label>
              </div>

              <button 
                type="submit" 
                disabled={status === "loading"}
                className="bg-charcoal text-white py-5 px-12 rounded-none font-bold tracking-[0.2em] uppercase hover:bg-black transition-colors self-start mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Sending..." : "Send Message"}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
