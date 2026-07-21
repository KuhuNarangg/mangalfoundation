import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { FloatingDonate } from "@/components/FloatingDonate";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mangal Guruji Foundation — Serving Humanity With Compassion",
    template: "%s | Mangal Guruji Foundation",
  },
  description:
    "Mangal Guruji Foundation is a non-profit serving humanity through food, clothing, women empowerment, and temple renovation initiatives. Donate today to make a difference.",
  applicationName: "Mangal Guruji Foundation",
  keywords: [
    "Mangal Guruji Foundation",
    "NGO",
    "donate",
    "charity India",
    "food donation",
    "clothes donation",
    "women empowerment",
    "temple renovation",
  ],
  authors: [{ name: "Mangal Guruji Foundation" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Mangal Guruji Foundation",
    title: "Mangal Guruji Foundation — Serving Humanity With Compassion",
    description:
      "Donate to support food, clothing, women empowerment, and temple renovation initiatives.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mangal Guruji Foundation",
    description:
      "Serving Humanity With Compassion — donate to support our initiatives.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} h-full antialiased smooth-scroll`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Providers>{children}</Providers>
        <FloatingDonate />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
