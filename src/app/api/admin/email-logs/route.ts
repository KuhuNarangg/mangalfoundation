import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import EmailLog from "@/models/EmailLog";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  const { response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "50", 10) || 50));
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const logs = await EmailLog.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await EmailLog.countDocuments();

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch email logs" }, { status: 500 });
  }
}
