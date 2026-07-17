"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is my donation tax-deductible?",
    answer: "Yes. The Mangal Guruji Foundation is a registered non-profit organization. You will receive an 80G tax exemption certificate for your contribution."
  },
  {
    question: "Can I donate physical items instead of money?",
    answer: "Absolutely. We run periodic collection drives for clothes, books, and non-perishable food. Please contact our support team to schedule a drop-off."
  },
  {
    question: "How do I know where my money is going?",
    answer: "Transparency is our core value. We publish annual reports detailing exactly how funds are allocated across our various initiatives."
  },
  {
    question: "Do you accept international donations?",
    answer: "Currently, we are in the process of setting up our FCRA compliance to accept international funds. We will announce it as soon as it is active."
  }
];

export function FAQ() {
  return (
    <section className="py-24 bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            className="font-heading text-4xl md:text-5xl text-charcoal mb-4"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-light"
          >
            Everything you need to know about donating to the foundation.
          </motion.p>
        </div>

        <motion.div
        >
          <Accordion className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-gray-200 py-2">
                <AccordionTrigger className="text-left font-medium text-lg text-charcoal hover:no-underline hover:text-black">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 font-light text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
