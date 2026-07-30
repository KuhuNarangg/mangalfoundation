import mongoose from "mongoose";
import Category from "./src/models/Category";
import { CATEGORIES } from "./src/data/categories";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

async function cleanupCategories() {
  await mongoose.connect(MONGODB_URI as string);
  console.log("Connected to MongoDB");

  const staticSlugs = CATEGORIES.map((c) => c.slug);
  console.log("Static slugs to KEEP:", staticSlugs);

  const result = await Category.deleteMany({
    slug: { $nin: staticSlugs }
  });

  console.log(`Deleted ${result.deletedCount} manually added categories.`);

  await mongoose.disconnect();
}

cleanupCategories().catch(console.error);
