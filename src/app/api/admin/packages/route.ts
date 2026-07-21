import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Package from "@/models/Package";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";
import { packageInputSchema, formatZodError } from "@/lib/validations";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectToDatabase();
    const packages = await Package.find()
      .populate("categoryId", "title")
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: packages });
  } catch {
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { session, response } = await requireAdmin(["super_admin", "admin", "editor"]);
  if (response) return response;

  try {
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = packageInputSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // The referenced category must exist.
    const category = await Category.findById(parsed.data.categoryId).lean();
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }

    const newPackage = await Package.create(parsed.data);

    await logAudit({
      action: "package.create",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Package",
      targetId: newPackage._id.toString(),
      message: `Created package "${newPackage.title}"`,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, data: newPackage }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}
