import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const { default: Category } = await import("./src/models/Category.ts");
  const cats = await Category.find();
  console.log("DB Cats:", cats.map((c: any) => c.title));
  process.exit();
};
run();
