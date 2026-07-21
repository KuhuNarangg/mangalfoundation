import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Donation from "@/models/Donation";
import Category from "@/models/Category";
import "@/models/Package";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";
import { manualDonationSchema, formatZodError } from "@/lib/validations";
import { generateReceiptNumber } from "@/lib/receipt";

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
      500,
      Math.max(1, parseInt(searchParams.get("limit") || "50", 10) || 50)
    );
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");

    await connectToDatabase();

    const query: Record<string, any> = {};
    if (status && ["pending", "success", "failed", "refunded"].includes(status)) {
      query.paymentStatus = status;
    }
    if (categoryId && /^[0-9a-fA-F]{24}$/.test(categoryId)) {
      query.categoryId = categoryId;
    }
    if (search) {
      const rx = new RegExp(escapeRegex(search), "i");
      query.$or = [{ donorName: rx }, { email: rx }, { phone: rx }];
    }
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseInt(minAmount, 10);
      if (maxAmount) query.amount.$lte = parseInt(maxAmount, 10);
    }

    const [data, total] = await Promise.all([
      Donation.find(query)
        .populate("categoryId", "title")
        .populate("packageId", "title")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Donation.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 });
  }
}

// Manually record an offline donation. Stored as a successful donation so it
// flows into every total, category breakdown, and monthly-progress calculation
// exactly like an online one. createdAt is set to the entered date.
export async function POST(req: Request) {
  const { session, response } = await requireAdmin(["super_admin", "admin", "editor"]);
  if (response) return response;

  try {
    const json = await req.json().catch(() => null);
    const parsed = manualDonationSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(parsed.error) },
        { status: 400 }
      );
    }
    const data = parsed.data;

    await connectToDatabase();
    const category = await Category.findById(data.categoryId).lean();
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }

    const date = data.date ? new Date(data.date) : new Date();
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const receiptNumber = await generateReceiptNumber(date);
    const donation = new Donation({
      donorName: data.isAnonymous ? "Anonymous" : data.donorName,
      email: data.email || "",
      phone: data.phone || "",
      isAnonymous: data.isAnonymous ?? false,
      notes: data.notes || "",
      categoryId: data.categoryId,
      amount: data.amount,
      paymentStatus: "success",
      source: "manual",
      paymentMethod: data.paymentMethod,
      receiptNumber,
      createdAt: date,
      updatedAt: date,
    });
    // Skip Mongoose's automatic timestamps so our backdated createdAt sticks.
    await donation.save({ timestamps: false });

    await logAudit({
      action: "donation.manual_create",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Donation",
      targetId: donation._id.toString(),
      message: `Recorded ₹${data.amount} ${data.paymentMethod} donation`,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, data: donation }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to record donation" }, { status: 500 });
  }
}
