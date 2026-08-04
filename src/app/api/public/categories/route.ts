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
    
    const result: any[] = [];
    const processedDbIds = new Set();

    // 1. Process static categories (and merge with DB if they exist)
    for (const staticCat of CATEGORIES) {
      const dbCat = categories.find(c => c.slug === staticCat.slug || c.title === staticCat.title);
      const catId = dbCat ? dbCat._id.toString() : "";
      if (dbCat) processedDbIds.add(catId);
      
      result.push({
        ...staticCat,
        title: dbCat?.title || staticCat.title,
        description: dbCat?.description || staticCat.description,
        image: dbCat?.image || staticCat.image,
        _id: catId,
        packages: staticCat.packages.map((pkg) => ({
          ...pkg,
          _id: pkg.id,
          categoryId: catId,
        })),
        budget: dbCat ? computeBudget(dbCat as any, raisedMap[catId] || 0) : null,
      });
    }

    // 2. Add purely dynamic categories that aren't in the static list
    for (const dbCat of categories) {
      const catId = dbCat._id.toString();
      if (!processedDbIds.has(catId)) {
        const catPackages = packages.filter(p => p.categoryId === catId).map(p => ({
          ...p,
          id: p._id.toString(),
          _id: p._id.toString(),
          categoryId: catId,
        }));
        
        result.push({
          title: dbCat.title,
          slug: dbCat.slug,
          description: dbCat.description,
          image: dbCat.image || "",
          galleryImages: dbCat.galleryImages || [],
          _id: catId,
          packages: catPackages,
          budget: computeBudget(dbCat as any, raisedMap[catId] || 0),
        });
      }
    }

    // Custom sorting as requested: Food -> Go Seva -> Clothes -> Women -> Temple (last)
    result.sort((a, b) => {
      const getPriority = (title: string) => {
        const lower = title.toLowerCase();
        if (lower.includes("food") || lower.includes("annadan")) return 1;
        if (lower.includes("cow") || lower.includes("go seva")) return 2;
        if (lower.includes("cloth") || lower.includes("vastra")) return 3;
        if (lower.includes("women") || lower.includes("girl")) return 4;
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
