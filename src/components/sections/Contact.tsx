"use client";

import { motion } from "framer-motion";

export function Contact() {
  return (
    <section id="contact" className="py-32 bg-sand text-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-24">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 flex flex-col justify-center"
          >
            <h2 className="font-heading text-6xl md:text-8xl text-charcoal mb-8 leading-none">Let's Talk.</h2>
            <p className="text-charcoal-light text-xl md:text-2xl font-light mb-16 max-w-lg">
              Have questions or want to collaborate? We would love to hear from you. Send us a message and become part of our journey.
            </p>
            
            <div className="space-y-12">
              <div>
                <h4 className="font-bold uppercase tracking-[0.2em] text-sm text-charcoal mb-2">Visit Us</h4>
                <p className="text-charcoal-light font-light text-lg">123 Compassion Street<br/>Humanity City, HC 10001</p>
              </div>
              
              <div>
                <h4 className="font-bold uppercase tracking-[0.2em] text-sm text-charcoal mb-2">Email Us</h4>
                <a href="mailto:hello@mangalgurujifoundation.org" className="text-charcoal-light font-light text-lg hover:text-charcoal transition-colors border-b border-charcoal-light pb-1">
                  hello@mangalgurujifoundation.org
                </a>
              </div>
              
              <div>
                <h4 className="font-bold uppercase tracking-[0.2em] text-sm text-charcoal mb-2">Call Us</h4>
                <p className="text-charcoal-light font-light text-lg">+1 (555) 123-4567</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2"
          >
            <form className="h-full flex flex-col justify-center gap-12">
              <div className="relative">
                <input 
                  type="text" 
                  id="name" 
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

              <button type="button" className="bg-charcoal text-white py-5 px-12 rounded-none font-bold tracking-[0.2em] uppercase hover:bg-black transition-colors self-start mt-4">
                Send Message
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
