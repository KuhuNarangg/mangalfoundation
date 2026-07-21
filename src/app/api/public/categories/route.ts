import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Category from "@/models/Category";
import Package from "@/models/Package";
import { getRaisedByCategory, computeBudget } from "@/lib/budget";

export async function GET() {
  try {
    await connectToDatabase();

    const [categories, packages, raisedMap] = await Promise.all([
      Category.find({ isActive: true }).sort({ createdAt: 1 }).lean(),
      Package.find({ isActive: true }).lean(),
      getRaisedByCategory(),
    ]);

    // Group packages by category and attach the live budget picture.
    const result = categories.map((cat) => ({
      ...cat,
      packages: packages.filter(
        (pkg) => pkg.categoryId.toString() === cat._id.toString()
      ),
      budget: computeBudget(cat, raisedMap[cat._id.toString()] || 0),
    }));

    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch active categories" },
      { status: 500 }
    );
  }
}
