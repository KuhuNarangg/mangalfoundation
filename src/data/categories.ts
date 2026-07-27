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
  packages: CategoryPackage[];
};

export const CATEGORIES: CategoryDetails[] = [
  {
    title: "Food",
    slug: "food",
    description: "Provide nutritious meals to those in need. Your contribution helps fight hunger and malnutrition in marginalized communities.",
    image: "/images/col2.jpg",
    packages: [
      {
        id: "food-50",
        title: "₹50 Meal",
        description: "Samosa + Chai or Samosa + Bread Pakora. A quick, fulfilling snack for daily wage workers and street children.",
        amount: 50,
        impactStatement: "Provides immediate hunger relief to 1 person.",
      },
      {
        id: "food-100",
        title: "₹100 Meal",
        description: "Complete Thali (Rice, Dal, Sabzi, Roti). A wholesome, nutritious meal that provides balanced energy for the day.",
        amount: 100,
        impactStatement: "Provides a full, nutritious meal to 1 person.",
      },
      {
        id: "food-200",
        title: "₹200 Meal",
        description: "Nutritious Family Meal. Enough food to feed a small family, ensuring no one goes to sleep hungry.",
        amount: 200,
        impactStatement: "Feeds a family of 3-4 people.",
      },
      {
        id: "food-500",
        title: "Weekly Ration Kit",
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
    image: "/images/srimathi-jayaprakash-uO1MUMn0Xzc-unsplash.jpg",
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
    title: "Environment",
    slug: "environment",
    description: "Promote environmental conservation, cleanliness, tree plantation, social unity, and community development.",
    image: "/images/col1.jpg",
    packages: [
      {
        id: "env-tree",
        title: "Tree Plantation",
        description: "Plant and nurture a native tree sapling to maturity.",
        amount: 100,
        impactStatement: "Adds 1 tree to our growing green cover.",
      },
      {
        id: "env-clean",
        title: "Community Clean-up Drive",
        description: "Provide tools and safety gear for volunteer clean-up initiatives.",
        amount: 500,
        impactStatement: "Supports 1 local clean-up event.",
      }
    ]
  },
  {
    title: "Humanitarian Service",
    slug: "humanitarian-service",
    description: "Work continuously for the holistic development of society through the values of service, compassion, dedication, and humanity.",
    image: "/images/larm-rmah-AEaTUnvneik-unsplash.jpg",
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
    image: "/images/nico-smit-NFoerQuvzrs-unsplash.jpg",
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
  }
];
