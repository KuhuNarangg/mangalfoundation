import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";
import { passwordChangeSchema, formatZodError } from "@/lib/validations";

export async function POST(req: Request) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  try {
    const json = await req.json().catch(() => null);
    const parsed = passwordChangeSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(parsed.error) },
        { status: 400 }
      );
    }
    const { currentPassword, newPassword } = parsed.data;

    await connectToDatabase();
    const admin = await Admin.findById(session.id);
    if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const ok = await bcrypt.compare(currentPassword, admin.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    const salt = await bcrypt.genSalt(12);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    await logAudit({
      action: "account.password_change",
      actorId: session.id,
      actorUsername: session.username,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, message: "Password updated" });
  } catch {
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
