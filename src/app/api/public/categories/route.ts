import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Category from "@/models/Category";
import Package from "@/models/Package";

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find({ isActive: true }).lean();
    const packages = await Package.find({ isActive: true }).lean();

    // Group packages by category
    const result = categories.map((cat) => {
      return {
        ...cat,
        packages: packages.filter((pkg) => pkg.categoryId.toString() === cat._id.toString())
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch active categories" }, { status: 500 });
  }
}
