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
    // MERGE STATIC DATA with DB DATA to ensure missing packages show up
    const { CATEGORIES } = await import("@/data/categories");
    
    const result = CATEGORIES.map((staticCat) => {
      // Find matching DB category to get the _id and budget
      const dbCat = categories.find(c => c.title === staticCat.title);
      const catId = dbCat ? dbCat._id.toString() : "";
      
      return {
        ...staticCat,
        _id: catId,
        packages: staticCat.packages.map((pkg) => {
          // If we want to map package ids, we can just use the static pkg
          // We need an _id for React keys and for the donation handler
          return {
            ...pkg,
            _id: pkg.id, // the static string id like "food-50"
            categoryId: catId,
          }
        }),
        budget: dbCat ? computeBudget(dbCat, raisedMap[catId] || 0) : null,
      };
    });

    // Custom sorting as requested: Food -> Clothes -> Women -> Temple (last)
    result.sort((a, b) => {
      const getPriority = (title: string) => {
        const lower = title.toLowerCase();
        if (lower.includes("food") || lower.includes("annadan")) return 1;
        if (lower.includes("cloth") || lower.includes("vastra")) return 2;
        if (lower.includes("women") || lower.includes("girl")) return 3;
        if (lower.includes("temple") || lower.includes("mandir")) return 99;
        return 50; // default for others
      };
      return getPriority(a.title) - getPriority(b.title);
    });

    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch active categories" },
      { status: 500 }
    );
  }
}
