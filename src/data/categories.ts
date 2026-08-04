export type CategoryPackage = {
  id: string;
  title: string;
  description: string;
  amount: number;
  impactStatement?: string;
  image?: string;
};

export type CategoryDetails = {
  title: string;
  slug: string;
  description: string;
  image: string;
  galleryImages?: string[];
  packages: CategoryPackage[];
};

export const CATEGORIES: CategoryDetails[] = [
  {
    title: "Food",
    slug: "food",
    description: "Provide nutritious meals to those in need. Your contribution helps fight hunger and malnutrition in marginalized communities.",
    image: "/images/nico-smit-NFoerQuvzrs-unsplash.jpg",
    galleryImages: [
      "/images/food/joel-muniz-3k3l2brxmwQ-unsplash.jpg",
      "/images/food/khalil-radi-BlzrvWb1_vQ-unsplash.jpg",
      "/images/food/usman-ahmed-YQE0XlUoupw-unsplash.jpg",
      "/images/food/zekeriya-sen-iIZXUKjWFAA-unsplash.jpg",
    ],
    packages: [
      {
        id: "food-20",
        title: "₹20 Tea + Biscuit",
        description: "A warm cup of tea with biscuits. Perfect for providing immediate warmth and comfort to daily wage workers and homeless individuals.",
        amount: 20,
        impactStatement: "Provides immediate comfort to 1 person.",
      },
      {
        id: "food-50",
        title: "₹50 Tea + Samosa",
        description: "A classic Indian snack combo of tea and samosa, providing quick energy for someone working hard all day.",
        amount: 50,
        impactStatement: "Provides a quick, fulfilling snack to 1 person.",
      },
      {
        id: "food-100",
        title: "₹100 Roti + Sabzi + Dal",
        description: "A complete, nutritious meal comprising fresh rotis, sabzi, and dal. Ensures a balanced diet and sustained energy.",
        amount: 100,
        impactStatement: "Provides a full, nutritious meal to 1 person.",
      },
      {
        id: "food-200",
        title: "₹200 Family Meal",
        description: "Nutritious Family Meal. Enough food to feed a small family, ensuring no one goes to sleep hungry.",
        amount: 200,
        impactStatement: "Feeds a family of 3-4 people.",
      },
      {
        id: "food-500",
        title: "₹500 Weekly Ration Kit",
        description: "Rice, Dal, Oil, Salt, and basic spices to support a family for an entire week.",
        amount: 500,
        impactStatement: "Sustains a family's nutritional needs for 1 week.",
      }
    ]
  },
  {
    title: "Women Empowerment",
    slug: "women-empowerment",
    description: "Help women become self-reliant, skilled, confident, and financially independent while enabling them to live with dignity.",
    image: "/images/women2.jpg",
    galleryImages: [
      "/images/women/amol-sonar-1KntWz6Hpgc-unsplash.jpg",
      "/images/women/ibrahim-rifath-oLVV_o45GIA-unsplash.jpg",
      "/images/women/lewis-j-goetz-67heLkXJ340-unsplash.jpg",
      "/images/women/srimathi-jayaprakash-uO1MUMn0Xzc-unsplash.jpg",
    ],
    packages: [
      {
        id: "we-sewing",
        title: "Sewing Machine (Silai Machine)",
        description: "Provide a sewing machine to a woman, enabling her to start a tailoring business from home and achieve financial independence.",
        amount: 5000,
        impactStatement: "Creates a sustainable livelihood for 1 family.",
      },
      {
        id: "we-education",
        title: "Women's Education",
        description: "Support adult literacy classes and higher education opportunities for women who were previously denied schooling.",
        amount: 2000,
        impactStatement: "Sponsors a woman's education for 6 months.",
      },
      {
        id: "we-skill",
        title: "Skill Development & Vocational Training",
        description: "Fund training programs in computer literacy, handicrafts, or beauty services to prepare women for the modern workforce.",
        amount: 3000,
        impactStatement: "Equips a woman with employable skills.",
      },
      {
        id: "we-shg",
        title: "Self-Help Group Support",
        description: "Provide micro-funding to a local women's self-help group to start a collective enterprise.",
        amount: 10000,
        impactStatement: "Empowers a group of 10-15 women.",
      },
      {
        id: "we-biz",
        title: "Micro-Business Starter Kit",
        description: "Basic tools, raw materials, and guidance to help a woman launch a small-scale home business.",
        amount: 4000,
        impactStatement: "Launches 1 new female-led micro-business.",
      },
      {
        id: "we-digital",
        title: "Digital Literacy Programs",
        description: "Teach essential digital skills including online banking, safe internet usage, and digital communication.",
        amount: 1500,
        impactStatement: "Bridges the digital divide for 5 women.",
      },
      {
        id: "we-health",
        title: "Health & Hygiene Kits",
        description: "Provide sanitary pads, hygiene products, and reproductive health education to women in rural areas.",
        amount: 500,
        impactStatement: "Supports the health of 1 woman for 3 months.",
      },
      {
        id: "we-finance",
        title: "Financial Independence Initiatives",
        description: "Workshops on financial planning, savings, and micro-investments to secure long-term stability.",
        amount: 1000,
        impactStatement: "Provides financial literacy training to 10 women.",
      }
    ]
  },
  {
    title: "Education",
    slug: "education",
    description: "Provide quality education, career guidance, and skill development to underprivileged, poor, and marginalized children.",
    image: "/images/larm-rmah-AEaTUnvneik-unsplash.jpg",
    galleryImages: [
      "/images/education/celine-ly-GqmoOqmoAYg-unsplash.jpg",
      "/images/education/oswald-elsaboath-wtLpWnliBEs-unsplash.jpg",
      "/images/education/yannis-h-uaPaEM7MiQQ-unsplash.jpg",
    ],
    packages: [
      {
        id: "edu-fee",
        title: "School Fee Support",
        description: "Cover the annual school tuition fees for a child who would otherwise drop out due to financial constraints.",
        amount: 3000,
        impactStatement: "Keeps 1 child in school for an entire year.",
      },
      {
        id: "edu-kit",
        title: "Books & Stationery Kits",
        description: "A complete set of textbooks, notebooks, pens, pencils, and art supplies needed for the school year.",
        amount: 800,
        impactStatement: "Equips 1 student with essential learning tools.",
      },
      {
        id: "edu-uniform",
        title: "School Uniforms",
        description: "Provide two sets of school uniforms, shoes, and winter wear for a student.",
        amount: 1200,
        impactStatement: "Ensures 1 child can attend school with dignity.",
      },
      {
        id: "edu-digital",
        title: "Digital Learning Resources",
        description: "Contribute to a shared pool for tablets, smart boards, and internet access in rural classrooms.",
        amount: 5000,
        impactStatement: "Modernizes learning for an entire classroom.",
      },
      {
        id: "edu-scholarship",
        title: "Scholarship Programs",
        description: "Support exceptional students in pursuing higher education and specialized degrees.",
        amount: 10000,
        impactStatement: "Funds 1 semester of higher education.",
      },
      {
        id: "edu-tutor",
        title: "After-School Tutoring",
        description: "Fund evening remedial classes to help struggling students catch up to their grade level.",
        amount: 1500,
        impactStatement: "Provides 1 month of tutoring for 5 students.",
      }
    ]
  },
  {
    title: "Healthcare",
    slug: "healthcare",
    description: "Improve public health through health awareness programs, medical assistance, healthcare camps, and preventive initiatives.",
    image: "/images/yannis-h-uaPaEM7MiQQ-unsplash.jpg",
    galleryImages: [
      "/images/health/ocg-saving-the-ocean-_1j7_atc0z8-unsplash.jpg",
      "/images/health/roman-synkevych-5wJ2GiYSifA-unsplash.jpg",
      "/images/health/saad-ali-jns3PkQU1xY-unsplash.jpg",
    ],
    packages: [
      {
        id: "hc-camp",
        title: "Medical Camp Sponsorship",
        description: "Help fund a free medical checkup camp in a rural village.",
        amount: 5000,
        impactStatement: "Provides basic screening for up to 50 people.",
      },
      {
        id: "hc-meds",
        title: "Essential Medicines",
        description: "Provide life-saving medicines for elderly and chronically ill patients who cannot afford them.",
        amount: 1000,
        impactStatement: "Supplies 1 month of medication.",
      }
    ]
  },

  {
    title: "Humanitarian Service",
    slug: "humanitarian-service",
    description: "Work continuously for the holistic development of society through the values of service, compassion, dedication, and humanity.",
    image: "/images/larm-rmah-AEaTUnvneik-unsplash.jpg",
    galleryImages: [
      "/images/huminatarian/emmanuel-ikwuegbu-VC6MGt9ZoBA-unsplash.jpg",
      "/images/huminatarian/oscar-bartlett-bs-_YaiWSZs-unsplash.jpg",
      "/images/huminatarian/saad-ali-rE-8SyIDUis-unsplash.jpg",
      "/images/huminatarian/varun-gaba-O_H7BlvtZ8Y-unsplash.jpg",
    ],
    packages: [
      {
        id: "hum-disaster",
        title: "Disaster Relief Fund",
        description: "Contribute to our emergency fund used for immediate deployment of aid during natural disasters.",
        amount: 2000,
        impactStatement: "Provides emergency rations for 1 family.",
      },
      {
        id: "hum-shelter",
        title: "Winter Blanket Drive",
        description: "Provide warm, high-quality blankets to homeless individuals during severe winter months.",
        amount: 400,
        impactStatement: "Keeps 1 person warm throughout winter.",
      }
    ]
  },
  {
    title: "Clothes",
    slug: "clothes",
    description: "Donate winter clothes, summer wear, and daily essentials to protect people from harsh weather and restore their dignity.",
    image: "/images/col1.jpg",
    galleryImages: [
      "/images/clothes/251017_ClothesBoxFoundation_04.jpg",
      "/images/clothes/sarah-brown-oa7pqZmmhuA-unsplash.jpg",
      "/images/clothes/soundofhope.jpg",
    ],
    packages: [
      {
        id: "clothes-winter",
        title: "Winter Wear",
        description: "Provide warm jackets, sweaters, and thermals for harsh winters.",
        amount: 1500,
        impactStatement: "Protects 1 person from severe cold.",
      },
      {
        id: "clothes-summer",
        title: "Summer Wear",
        description: "Light, breathable cotton clothes for daily wage workers.",
        amount: 800,
        impactStatement: "Provides comfortable daily wear for 1 person.",
      },
      {
        id: "clothes-shoes",
        title: "Shoes & Footwear",
        description: "Durable shoes for children and adults who walk barefoot.",
        amount: 600,
        impactStatement: "Protects the feet of 1 person from injuries and infections.",
      },
      {
        id: "clothes-blankets",
        title: "Blankets",
        description: "Thick, high-quality blankets for the homeless.",
        amount: 400,
        impactStatement: "Keeps 1 homeless person warm at night.",
      },
      {
        id: "clothes-children",
        title: "Children's Clothing",
        description: "Complete sets of everyday wear for growing children.",
        amount: 1000,
        impactStatement: "Clothes 2 children with essential daily wear.",
      },
      {
        id: "clothes-women",
        title: "Women's Clothing",
        description: "Sarees, suits, and daily wear essentials for women.",
        amount: 1200,
        impactStatement: "Restores dignity with new clothing for 1 woman.",
      },
      {
        id: "clothes-men",
        title: "Men's Clothing",
        description: "Shirts and trousers for men seeking employment.",
        amount: 1200,
        impactStatement: "Provides presentable clothing for 1 man.",
      },
      {
        id: "clothes-uniform",
        title: "School Uniforms",
        description: "Complete school uniform, shoes, and socks for a student.",
        amount: 1200,
        impactStatement: "Enables 1 child to attend school proudly.",
      }
    ]
  },
  {
    title: "Temple Donation",
    slug: "temple-donation",
    description: "Support sacred temples, daily worship, festival celebrations, and temple maintenance to keep ancient traditions and spiritual heritage alive.",
    image: "/images/temple.jpg",
    galleryImages: [
      "/images/temple.jpg",
      "/images/temple2.avif",
      "/images/temple3.avif",
      "/images/temple4.avif",
      "/images/temple5.avif",
      "/images/temple6.avif",
      "/images/temple7.avif",
    ],
    packages: [
      {
        id: "temple-seva",
        title: "Temple Seva",
        description: "Contribute towards temple maintenance, cleaning, decoration, lighting, and other daily temple needs.",
        amount: 2100,
        impactStatement: "Supports daily maintenance & upkeep of temple premises.",
        image: "/images/temple2.avif",
      },
      {
        id: "temple-puja",
        title: "Puja & Aarti Seva",
        description: "Allow devotees to contribute towards daily puja, aarti, flowers, diya, and other worship essentials.",
        amount: 1100,
        impactStatement: "Sponsors daily worship essentials, diyas, and flowers.",
        image: "/images/temple3.avif",
      },
      {
        id: "temple-festival",
        title: "Festival Seva",
        description: "Contribute towards special pujas, decorations, prasad, and arrangements during festivals and religious occasions.",
        amount: 5100,
        impactStatement: "Funds festival pujas, prasad distribution & decorations.",
        image: "/images/temple4.avif",
      },
    ]
  },
  {
    title: "Gau Seva",
    slug: "gau-seva",
    description: "Serve and protect sacred cows by providing fresh fodder, medical treatment, clean water, gaushala support, and lifelong care.",
    image: "/images/cow1.webp",
    galleryImages: [
      "/images/cow1.webp",
      "/images/cow2.jpg",
      "/images/cow3.jpg",
    ],
    packages: [
      {
        id: "gau-feed",
        title: "Feed a Cow",
        description: "Provide fresh green grass and nutritious daily meals for hungry cows.",
        amount: 100,
        impactStatement: "Feeds 1 cow with nutritious daily food.",
        image: "/images/cow1.webp",
      },
      {
        id: "gau-fodder",
        title: "Sponsor Cow Fodder",
        description: "Sponsor green fodder, dry grass, and nutritional supplements for gaushala cows.",
        amount: 500,
        impactStatement: "Provides healthy fodder for multiple cows.",
        image: "/images/cow2.jpg",
      },
      {
        id: "gau-medical",
        title: "Medical Care Seva",
        description: "Provide veterinary care, essential medicines, treatments, and first aid for sick or injured cows.",
        amount: 1100,
        impactStatement: "Funds medical care and emergency medicines for cows.",
        image: "/images/cow3.jpg",
      },
      {
        id: "gau-adopt",
        title: "Adopt/Sponsor a Cow",
        description: "Take complete responsibility for a cow's monthly food, healthcare, shelter, and lifelong care.",
        amount: 2500,
        impactStatement: "Sponsors a cow's complete care for 1 month.",
        image: "/images/cow1.webp",
      },
      {
        id: "gau-gaushala",
        title: "Gaushala Donation",
        description: "Support gaushala operations, infrastructure repair, shade construction, and staff maintenance.",
        amount: 5000,
        impactStatement: "Improves living conditions & shelter in the gaushala.",
        image: "/images/cow2.jpg",
      },
      {
        id: "gau-volunteer",
        title: "Volunteer at Gaushala",
        description: "Join our volunteers at the gaushala to help feed, clean, and care for cows directly.",
        amount: 200,
        impactStatement: "Supports volunteer logistics and direct hands-on care.",
        image: "/images/cow3.jpg",
      },
      {
        id: "gau-water",
        title: "Water Seva",
        description: "Install clean drinking water troughs and supply fresh water 24/7 at gaushalas and public spots.",
        amount: 350,
        impactStatement: "Ensures fresh drinking water for cows daily.",
        image: "/images/cow1.webp",
      },
      {
        id: "gau-occasion",
        title: "Special Occasion Seva",
        description: "Celebrate birthdays, anniversaries, or special family occasions by organizing cow feeding.",
        amount: 1500,
        impactStatement: "Feeds gaushala cows on your special day.",
        image: "/images/cow2.jpg",
      },
    ]
  }
];
