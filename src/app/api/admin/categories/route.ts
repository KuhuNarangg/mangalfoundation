import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";
import { categoryInputSchema, formatZodError } from "@/lib/validations";
import { getRaisedByCategory, computeBudget } from "@/lib/budget";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectToDatabase();
    const [categories, raisedMap] = await Promise.all([
      Category.find().sort({ createdAt: -1 }).lean(),
      getRaisedByCategory(),
    ]);
    const data = categories.map((c) => ({
      ...c,
      budget: computeBudget(c, raisedMap[c._id.toString()] || 0),
    }));
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
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

    const parsed = categoryInputSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const category = await Category.create(parsed.data);

    await logAudit({
      action: "category.create",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Category",
      targetId: category._id.toString(),
      message: `Created category "${category.title}"`,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
