import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const { default: Category } = await import("./src/models/Category.js");
    const { default: Package } = await import("./src/models/Package.js");

    // 1. Check if Clothes category exists
    let clothesCategory = await Category.findOne({ slug: "clothes" });
    if (!clothesCategory) {
      clothesCategory = await Category.create({
        title: "Clothes",
        slug: "clothes",
        description: "Donate winter clothes, summer wear, and daily essentials to protect people from harsh weather and restore their dignity.",
        image: "/images/nico-smit-NFoerQuvzrs-unsplash.jpg",
        monthlyTarget: 50000,
        emergencyBudget: 0,
        carryForward: 0,
        isActive: true,
      });
      console.log("Created Clothes Category");
    } else {
      console.log("Clothes Category already exists");
    }

    const categoryId = clothesCategory._id;

    // 2. Packages to insert
    const packagesToInsert = [
      {
        title: "Winter Wear",
        description: "Provide warm jackets, sweaters, and thermals for harsh winters.",
        amount: 1500,
      },
      {
        title: "Summer Wear",
        description: "Light, breathable cotton clothes for daily wage workers.",
        amount: 800,
      },
      {
        title: "Shoes & Footwear",
        description: "Durable shoes for children and adults who walk barefoot.",
        amount: 600,
      },
      {
        title: "Blankets",
        description: "Thick, high-quality blankets for the homeless.",
        amount: 400,
      },
      {
        title: "Children's Clothing",
        description: "Complete sets of everyday wear for growing children.",
        amount: 1000,
      },
      {
        title: "Women's Clothing",
        description: "Sarees, suits, and daily wear essentials for women.",
        amount: 1200,
      },
      {
        title: "Men's Clothing",
        description: "Shirts and trousers for men seeking employment.",
        amount: 1200,
      },
      {
        title: "School Uniforms",
        description: "Complete school uniform, shoes, and socks for a student.",
        amount: 1200,
      }
    ];

    for (const pkg of packagesToInsert) {
      const existing = await Package.findOne({ categoryId, title: pkg.title });
      if (!existing) {
        await Package.create({
          categoryId,
          title: pkg.title,
          description: pkg.description,
          amount: pkg.amount,
          isActive: true
        });
        console.log("Created package:", pkg.title);
      }
    }

    console.log("Seed complete.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
