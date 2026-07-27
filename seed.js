require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const categorySchema = new mongoose.Schema({
    title: String, slug: String, description: String, image: String,
    monthlyTarget: Number, emergencyBudget: Number, carryForward: Number, isActive: Boolean
  }, { timestamps: true });
  
  const packageSchema = new mongoose.Schema({
    categoryId: mongoose.Schema.Types.ObjectId,
    title: String, description: String, amount: Number, isActive: Boolean
  }, { timestamps: true });

  const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
  const Package = mongoose.models.Package || mongoose.model("Package", packageSchema);

  let clothes = await Category.findOne({ slug: "clothes" });
  if (!clothes) {
    clothes = await Category.create({
      title: "Clothes", slug: "clothes",
      description: "Donate winter clothes, summer wear, and daily essentials to protect people from harsh weather and restore their dignity.",
      image: "/images/nico-smit-NFoerQuvzrs-unsplash.jpg",
      monthlyTarget: 50000, emergencyBudget: 0, carryForward: 0, isActive: true,
    });
    console.log("Created category");
  }

  const pkgs = [
    { title: "Winter Wear", description: "Provide warm jackets, sweaters, and thermals for harsh winters.", amount: 1500 },
    { title: "Summer Wear", description: "Light, breathable cotton clothes for daily wage workers.", amount: 800 },
    { title: "Shoes & Footwear", description: "Durable shoes for children and adults who walk barefoot.", amount: 600 },
    { title: "Blankets", description: "Thick, high-quality blankets for the homeless.", amount: 400 },
    { title: "Children's Clothing", description: "Complete sets of everyday wear for growing children.", amount: 1000 },
    { title: "Women's Clothing", description: "Sarees, suits, and daily wear essentials for women.", amount: 1200 },
    { title: "Men's Clothing", description: "Shirts and trousers for men seeking employment.", amount: 1200 },
    { title: "School Uniforms", description: "Complete school uniform, shoes, and socks for a student.", amount: 1200 }
  ];

  for (const p of pkgs) {
    const ex = await Package.findOne({ categoryId: clothes._id, title: p.title });
    if (!ex) {
      await Package.create({ categoryId: clothes._id, ...p, isActive: true });
      console.log("Created pkg", p.title);
    }
  }

  console.log("Done");
  process.exit(0);
}
run();
