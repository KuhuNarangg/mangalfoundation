import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Mangal Guruji Foundation",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto prose prose-gray dark:prose-invert">
      <h1 className="text-4xl font-heading font-bold mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2>1. Information We Collect</h2>
      <p>
        When you visit our website, donate, or volunteer, we may collect personal information such as your name, email address, phone number, and payment details. This information is necessary to process your donations and keep you updated on our initiatives.
      </p>

      <h2>2. How We Use Your Information</h2>
      <p>
        We use your information to:
      </p>
      <ul>
        <li>Process and acknowledge your donations</li>
        <li>Send you receipts and tax exemption certificates</li>
        <li>Communicate updates about our projects and campaigns</li>
        <li>Respond to your inquiries and support requests</li>
      </ul>

      <h2>3. Information Sharing and Disclosure</h2>
      <p>
        Mangal Guruji Foundation does not sell, rent, or trade your personal information to third parties. We only share information with trusted service providers (such as payment gateways) strictly for processing transactions securely.
      </p>

      <h2>4. Data Security</h2>
      <p>
        We implement robust security measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction. All payment transactions are encrypted and processed through secure third-party gateways.
      </p>

      <h2>5. Your Rights</h2>
      <p>
        You have the right to access, update, or request the deletion of your personal information. If you wish to exercise these rights or opt-out of our communications, please contact us.
      </p>

      <h2>6. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us at:
      </p>
      <ul>
        <li>Email: mangaljifoundation@gmail.com</li>
        <li>Phone: +91 8340110200, +91 9303362919</li>
      </ul>
    </main>
  );
}
