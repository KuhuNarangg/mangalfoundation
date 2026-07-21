import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Gallery from "@/models/Gallery";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
      48,
      Math.max(1, parseInt(searchParams.get("limit") || "12", 10) || 12)
    );

    await connectToDatabase();
    const [data, total] = await Promise.all([
      Gallery.find({ isActive: true })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Gallery.countDocuments({ isActive: true }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}
