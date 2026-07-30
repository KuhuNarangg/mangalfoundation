import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB.");

  // Import schemas
  const categorySchema = new mongoose.Schema({}, { strict: false });
  const packageSchema = new mongoose.Schema({}, { strict: false });
  const Category = mongoose.model("Category", categorySchema);
  const Package = mongoose.model("Package", packageSchema);

  const staticSlugs = [
    "food",
    "women-empowerment",
    "education",
    "healthcare",
    "humanitarian-service",
    "clothes"
  ];

  const manualCategories = await Category.find({ slug: { $nin: staticSlugs } });
  
  if (manualCategories.length === 0) {
    console.log("No manual categories found.");
  } else {
    console.log(`Found ${manualCategories.length} manual categories to delete.`);
    
    const catIds = manualCategories.map(c => c._id);
    
    const pkgRes = await Package.deleteMany({ categoryId: { $in: catIds } });
    console.log(`Deleted ${pkgRes.deletedCount} associated packages.`);
    
    const catRes = await Category.deleteMany({ _id: { $in: catIds } });
    console.log(`Deleted ${catRes.deletedCount} manual categories.`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
