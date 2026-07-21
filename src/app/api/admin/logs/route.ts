import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
      200,
      Math.max(1, parseInt(searchParams.get("limit") || "50", 10) || 50)
    );
    const action = searchParams.get("action");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};
    if (action) query.action = action;
    if (status && ["success", "failure"].includes(status)) query.status = status;

    await connectToDatabase();
    const [data, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
