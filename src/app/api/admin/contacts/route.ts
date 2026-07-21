import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "25", 10) || 25)
    );

    await connectToDatabase();
    const [data, total, unread] = await Promise.all([
      Contact.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Contact.countDocuments(),
      Contact.countDocuments({ isRead: false }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      unread,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
