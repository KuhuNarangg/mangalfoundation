require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const categorySchema = new mongoose.Schema({
  title: String, slug: String, description: String, image: String, isActive: Boolean
});
const packageSchema = new mongoose.Schema({
  title: String, description: String, amount: Number, categoryId: mongoose.Schema.Types.ObjectId, isActive: Boolean
});

async function run() {
  await mongoose.connect(MONGODB_URI);
  const Category = mongoose.model('Category', categorySchema);
  const Package = mongoose.model('Package', packageSchema);

  const CATEGORIES = [
  {
    title: "Food",
    slug: "food",
    description: "Provide nutritious meals to those in need. Your contribution helps fight hunger and malnutrition in marginalized communities.",
    image: "/images/nico-smit-NFoerQuvzrs-unsplash.jpg",
    packages: [
      { id: "food-50", title: "₹50 Meal", description: "Samosa + Chai or Samosa + Bread Pakora.", amount: 50 },
      { id: "food-100", title: "₹100 Meal", description: "Complete Thali (Rice, Dal, Sabzi, Roti).", amount: 100 },
      { id: "food-200", title: "₹200 Meal", description: "Nutritious Family Meal.", amount: 200 }
    ]
  },
  {
    title: "Clothes",
    slug: "clothes",
    description: "Donate winter clothes, summer wear, and daily essentials to protect people from harsh weather and restore their dignity.",
    image: "/images/col1.jpg",
    packages: [
      { id: "clothes-winter", title: "Winter Wear", description: "Warm jackets, sweaters, and shawls for the cold season.", amount: 500 },
      { id: "clothes-summer", title: "Summer Wear", description: "Light, breathable cotton clothes.", amount: 300 },
      { id: "clothes-shoes", title: "Shoes & Footwear", description: "Durable shoes or sandals.", amount: 400 },
      { id: "clothes-blankets", title: "Blankets", description: "Thick blankets for families living on the streets.", amount: 600 },
      { id: "clothes-children", title: "Children’s Clothing", description: "Everyday wear for kids in need.", amount: 350 },
      { id: "clothes-women", title: "Women’s Clothing", description: "Sarees, kurtis, and essential wear for women.", amount: 450 },
      { id: "clothes-men", title: "Men’s Clothing", description: "Shirts and trousers for men.", amount: 450 },
      { id: "clothes-school", title: "School Uniforms", description: "Complete uniforms for underprivileged students.", amount: 800 }
    ]
  }
  ];

  for (const cat of CATEGORIES) {
    let dbCat = await Category.findOne({ title: cat.title });
    if (!dbCat) {
      dbCat = new Category({ title: cat.title, slug: cat.slug, description: cat.description, image: cat.image, isActive: true });
      await dbCat.save();
    } else {
      dbCat.description = cat.description;
      dbCat.image = cat.image;
      await dbCat.save();
    }
    
    for (const pkg of cat.packages) {
      let dbPkg = await Package.findOne({ title: pkg.title, categoryId: dbCat._id });
      if (!dbPkg) {
        dbPkg = new Package({ title: pkg.title, description: pkg.description, amount: pkg.amount, categoryId: dbCat._id, isActive: true });
        await dbPkg.save();
      } else {
        dbPkg.description = pkg.description;
        dbPkg.amount = pkg.amount;
        await dbPkg.save();
      }
    }
  }

  // Deactivate environment
  const envCat = await Category.findOne({ title: "Environment" });
  if (envCat) {
    envCat.isActive = false;
    await envCat.save();
  }
  
  console.log("Success");
  process.exit(0);
}

run().catch(console.error);
