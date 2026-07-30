import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Category from "@/models/Category";
import Package from "@/models/Package";
import Donation from "@/models/Donation";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";
import { categoryUpdateSchema, formatZodError } from "@/lib/validations";
import { computeBudget, startOfMonth } from "@/lib/budget";

// Category detail: budget (this month) + all-time totals for the category header.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await connectToDatabase();
    const category = await Category.findById(id).lean();
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const objId = new mongoose.Types.ObjectId(id);
    const [monthAgg, allTimeAgg] = await Promise.all([
      Donation.aggregate([
        { $match: { categoryId: objId, paymentStatus: "success", createdAt: { $gte: startOfMonth() } } },
        { $group: { _id: null, total: { $sum: "$amount" }, n: { $sum: 1 } } },
      ]),
      Donation.aggregate([
        { $match: { categoryId: objId, paymentStatus: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" }, n: { $sum: 1 } } },
      ]),
    ]);

    const budget = computeBudget(category, monthAgg[0]?.total || 0);

    return NextResponse.json({
      success: true,
      data: {
        category,
        budget,
        monthCount: monthAgg[0]?.n || 0,
        allTimeRaised: allTimeAgg[0]?.total || 0,
        allTimeCount: allTimeAgg[0]?.n || 0,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAdmin(["super_admin", "admin", "editor"]);
  if (response) return response;

  try {
    const { id } = await params;

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = categoryUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const category = await Category.findByIdAndUpdate(id, parsed.data, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await logAudit({
      action: "category.update",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Category",
      targetId: id,
      message: `Updated category "${category.title}"`,
      metadata: { fields: Object.keys(parsed.data) },
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Editors may not delete — only admins and super admins.
  const { session, response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const { id } = await params;
    await connectToDatabase();

    // Preserve financial records: refuse to delete a category that has donations.
    const donationCount = await Donation.countDocuments({ categoryId: id });
    if (donationCount > 0) {
      return NextResponse.json(
        {
          error:
            "This category has donations linked to it. Deactivate it instead of deleting to preserve records.",
        },
        { status: 409 }
      );
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Cascade: remove the (donation-free) packages under this category.
    await Package.deleteMany({ categoryId: id });

    await logAudit({
      action: "category.delete",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Category",
      targetId: id,
      message: `Deleted category "${category.title}"`,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
