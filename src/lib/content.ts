export type SiteContentData = {
  hero: { badge: string; title: string; coloredTitle: string };
  about: { heading: string; name: string; para1: string; para2: string; quote: string };
  mission: { heading: string; description: string };
  impact: {
    heading: string;
    quote: string;
    stats: { value: number; suffix: string; label: string }[];
  };
  testimonial: { quote: string; author: string; role: string };
  contact: { heading: string; description: string; email: string; phone: string; address: string };
  socials: { facebook: string; instagram: string; twitter: string };
  footer: { description: string };
};

// Current live copy — used as defaults and as the editable starting point.
export const DEFAULT_CONTENT: SiteContentData = {
  hero: {
    badge: "Mangal Guruji Foundation",
    title: "Color the lives",
    coloredTitle: "Bring hope to those who need it most.",
  },
  about: {
    heading: "About The Founder",
    name: "Aditya Vikram Singh",
    para1:
      "At the age of 28, Aditya Vikram Singh reflects on his life as a journey filled with struggles, perseverance, and valuable life lessons. Growing up in an ordinary middle-class family, he experienced both hardships and opportunities that shaped his perspective on life.",
    para2:
      "Through personal challenges, he developed a strong belief that success should not only benefit oneself but should also be used to uplift others. His greatest aspiration is to ensure that future generations receive quality education, strong values, and proper mentorship.",
    quote:
      "A person’s greatest identity is not their achievements, but the positive impact they create in society.",
  },
  mission: {
    heading: "Our Mission",
    description:
      "The foundation dreams of creating a society where no one is left behind because of poverty, illiteracy, or lack of resources. We are committed to six core pillars of social change.",
  },
  impact: {
    heading: "Making a Lasting Impact",
    quote:
      "Education in every home, healthcare for every family, and dignity in every person’s life.",
    stats: [
      { value: 10000, suffix: "+", label: "Children Educated" },
      { value: 50000, suffix: "+", label: "Patients Treated" },
      { value: 5000, suffix: "+", label: "Women Empowered" },
      { value: 20000, suffix: "+", label: "Trees Planted" },
    ],
  },
  testimonial: {
    quote:
      "Education is the best investment. If you have knowledge, you can achieve anything.",
    author: "Aditya Vikram Singh",
    role: "Founder & Social Worker",
  },
  contact: {
    heading: "Let's Talk.",
    description:
      "Have questions or want to collaborate? We would love to hear from you. Send us a message and become part of our journey.",
    email: "hello@mangalgurujifoundation.org",
    phone: "",
    address: "",
  },
  socials: { facebook: "", instagram: "", twitter: "" },
  footer: {
    description:
      "Serving humanity with compassion. We believe in bringing hope and color to the lives of those who need it most.",
  },
};

/** Deep-merge a stored override onto the defaults so content is always complete. */
export function mergeContent(override: any): SiteContentData {
  const base = DEFAULT_CONTENT;
  if (!override || typeof override !== "object") return base;
  const out: any = {};
  for (const key of Object.keys(base)) {
    const b = (base as any)[key];
    const o = override[key];
    if (Array.isArray(b)) {
      out[key] = Array.isArray(o) && o.length ? o : b;
    } else if (b && typeof b === "object") {
      out[key] = { ...b, ...(o && typeof o === "object" ? o : {}) };
    } else {
      out[key] = o ?? b;
    }
  }
  return out as SiteContentData;
}
