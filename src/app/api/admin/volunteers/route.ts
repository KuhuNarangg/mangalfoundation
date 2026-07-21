import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Volunteer from "@/models/Volunteer";
import { requireAdmin } from "@/lib/auth";

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "25", 10) || 25));
    const status = searchParams.get("status");
    const area = searchParams.get("area");
    const availability = searchParams.get("availability");
    const search = searchParams.get("search");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const sort = searchParams.get("sort") || "newest";

    await connectToDatabase();

    const query: Record<string, any> = {};
    if (status) query.status = status;
    if (area) query.interestedAreas = area;
    if (availability) query.availability = availability;
    if (search) {
      const rx = new RegExp(escapeRegex(search), "i");
      query.$or = [{ fullName: rx }, { email: rx }, { phone: rx }, { city: rx }];
    }
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const sortSpec: Record<string, 1 | -1> =
      sort === "oldest"
        ? { createdAt: 1 }
        : sort === "name"
        ? { fullName: 1 }
        : sort === "status"
        ? { status: 1, createdAt: -1 }
        : { createdAt: -1 };

    const startMonth = new Date();
    startMonth.setDate(1);
    startMonth.setHours(0, 0, 0, 0);

    const [data, total, statusCounts, monthCount] = await Promise.all([
      Volunteer.find(query)
        .sort(sortSpec)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Volunteer.countDocuments(query),
      Volunteer.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
      Volunteer.countDocuments({ createdAt: { $gte: startMonth } }),
    ]);

    const counts: Record<string, number> = {
      Pending: 0,
      "In Review": 0,
      Contacted: 0,
      Accepted: 0,
      Rejected: 0,
    };
    let grandTotal = 0;
    for (const s of statusCounts) {
      counts[s._id] = s.n;
      grandTotal += s.n;
    }

    return NextResponse.json({
      success: true,
      data,
      stats: { total: grandTotal, thisMonth: monthCount, ...counts },
      pagination: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch volunteers" }, { status: 500 });
  }
}
