// Read-only inspection of the live DB. Run with:
//   node --env-file=.env.local scripts/db-inspect.mjs
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("No MONGODB_URI in env");
  process.exit(1);
}

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const db = mongoose.connection.db;

  const cats = await db.collection("categories").find({}).toArray();
  console.log(`=== CATEGORIES (${cats.length}) ===`);
  for (const c of cats) {
    console.log(
      `- "${c.title}" | slug=${c.slug} | active=${c.isActive} | monthlyTarget=${c.monthlyTarget} | _id=${c._id}`
    );
  }

  const pkgs = await db.collection("packages").find({}).toArray();
  console.log(`\n=== PACKAGES (${pkgs.length}) ===`);
  for (const p of pkgs) {
    console.log(`- "${p.title}" | ₹${p.amount} | catId=${p.categoryId} | active=${p.isActive}`);
  }

  const donAgg = await db
    .collection("donations")
    .aggregate([
      { $group: { _id: "$paymentStatus", n: { $sum: 1 }, sum: { $sum: "$amount" } } },
    ])
    .toArray();
  console.log(`\n=== DONATIONS by paymentStatus ===`);
  console.log(donAgg);

  const admins = await db.collection("admins").countDocuments();
  console.log(`\nadmins: ${admins}`);
  console.log("INSPECT_DONE");
} catch (e) {
  console.error("DB inspect failed:", e.message);
  process.exitCode = 2;
} finally {
  await mongoose.disconnect();
}
