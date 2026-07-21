import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";
import { adminCreateSchema, formatZodError } from "@/lib/validations";

export async function GET() {
  const { response } = await requireAdmin(["super_admin"]);
  if (response) return response;

  try {
    await connectToDatabase();
    const admins = await Admin.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, data: admins });
  } catch {
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { session, response } = await requireAdmin(["super_admin"]);
  if (response) return response;

  try {
    const json = await req.json().catch(() => null);
    const parsed = adminCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(parsed.error) },
        { status: 400 }
      );
    }
    const { username, password, name, email, role } = parsed.data;

    await connectToDatabase();
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      username,
      password: hashed,
      name: name || "",
      email: email || "",
      role,
    });

    await logAudit({
      action: "admin.create",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Admin",
      targetId: admin._id.toString(),
      message: `Created admin "${username}" (${role})`,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    const { password: _pw, ...safe } = admin.toObject();
    return NextResponse.json({ success: true, data: safe }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
  }
}
