import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and Conditions for Mangal Guruji Foundation",
};

export default function TermsAndConditionsPage() {
  return (
    <main className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto prose prose-gray dark:prose-invert">
      <h1 className="text-4xl font-heading font-bold mb-8">Terms & Conditions</h1>
      <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing and using the Mangal Guruji Foundation website, you accept and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our website.
      </p>

      <h2>2. Use of the Website</h2>
      <p>
        You agree to use this website only for lawful purposes and in a manner that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the website.
      </p>

      <h2>3. Donations and Refunds</h2>
      <p>
        All donations made through our website are voluntary and non-refundable. If an error occurs during your transaction, please contact us immediately for assistance. Mangal Guruji Foundation reserves the right to use the donated funds for any of its active initiatives unless specifically earmarked by the donor.
      </p>

      <h2>4. Intellectual Property</h2>
      <p>
        All content, logos, images, and text on this website are the property of Mangal Guruji Foundation unless otherwise stated. You may not reproduce, distribute, or use this content for commercial purposes without our explicit written permission.
      </p>

      <h2>5. Limitation of Liability</h2>
      <p>
        Mangal Guruji Foundation will not be liable for any direct, indirect, incidental, or consequential damages arising from the use of or inability to use this website, or any information provided on the website.
      </p>

      <h2>6. Changes to Terms</h2>
      <p>
        We reserve the right to modify these Terms and Conditions at any time. Any changes will be posted on this page, and your continued use of the website constitutes acceptance of the modified terms.
      </p>

      <h2>7. Contact Information</h2>
      <p>
        If you have any questions regarding these Terms and Conditions, please contact us at:
      </p>
      <ul>
        <li>Email: mangaljifoundation@gmail.com</li>
        <li>Phone: +91 8340110200, +91 9303362919</li>
      </ul>
    </main>
  );
}
