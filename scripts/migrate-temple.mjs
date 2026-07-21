// Replace the "Rural Healthcare & Nutrition" category with "Temple Renovation
// & Temple Donations" IN PLACE (keeps _id, so donation history stays linked).
// Run: node --env-file=.env.local scripts/migrate-temple.mjs
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("No MONGODB_URI");
  process.exit(1);
}

const CAT_ID = new mongoose.Types.ObjectId("6a5e837e3811f09729c7bca7");
const PKG_1 = new mongoose.Types.ObjectId("6a5e837e3811f09729c7bca8");
const PKG_2 = new mongoose.Types.ObjectId("6a5e837e3811f09729c7bca9");

await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
const db = mongoose.connection.db;
const now = new Date();

// 1. Rename the category in place.
const cat = await db.collection("categories").updateOne(
  { _id: CAT_ID },
  {
    $set: {
      title: "Temple Renovation & Temple Donations",
      slug: "temple-renovation",
      description:
        "Support the construction, renovation, and daily maintenance of temples — structural repairs, idol seva, religious charity, and long-term temple development.",
      image: "/images/logo-lg.png",
      monthlyTarget: 200000,
      updatedAt: now,
    },
  }
);
console.log("category modified:", cat.modifiedCount);

// 2. Repurpose the 2 existing packages in place (preserves any donation links).
await db.collection("packages").updateOne(
  { _id: PKG_1 },
  {
    $set: {
      title: "Temple Renovation Fund",
      description: "Contribute toward structural repairs and renovation work.",
      amount: 5100,
      updatedAt: now,
    },
  }
);
await db.collection("packages").updateOne(
  { _id: PKG_2 },
  {
    $set: {
      title: "Idol Seva Sponsorship",
      description: "Sponsor idol seva and daily rituals at the temple.",
      amount: 2100,
      updatedAt: now,
    },
  }
);

// 3. Add two more temple packages (idempotent by title).
const existing = await db.collection("packages").find({ categoryId: CAT_ID }).toArray();
const titles = new Set(existing.map((p) => p.title));
const toAdd = [
  {
    title: "Sponsor a Brick",
    description: "Lay the foundation — sponsor bricks for temple construction.",
    amount: 500,
  },
  {
    title: "Daily Puja & Maintenance",
    description: "Fund a month of daily puja, lighting, and upkeep.",
    amount: 1100,
  },
]
  .filter((p) => !titles.has(p.title))
  .map((p) => ({
    ...p,
    categoryId: CAT_ID,
    image: "",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  }));
if (toAdd.length) {
  await db.collection("packages").insertMany(toAdd);
}
console.log("packages added:", toAdd.length);

// 4. Verify.
const updated = await db.collection("categories").findOne({ _id: CAT_ID });
console.log(`\nNow: "${updated.title}" | slug=${updated.slug} | target=${updated.monthlyTarget}`);
const pkgs = await db.collection("packages").find({ categoryId: CAT_ID }).toArray();
for (const p of pkgs) console.log(`  - ${p.title}: ₹${p.amount}`);
console.log("TEMPLE_MIGRATED");

await mongoose.disconnect();
