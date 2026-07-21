import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";
import { adminUpdateSchema, formatZodError } from "@/lib/validations";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAdmin(["super_admin"]);
  if (response) return response;

  try {
    const { id } = await params;
    const json = await req.json().catch(() => null);
    const parsed = adminUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    // Don't let a super admin lock themselves out.
    if (id === session.id && (parsed.data.role === "editor" || parsed.data.isActive === false)) {
      return NextResponse.json(
        { error: "You cannot demote or deactivate your own account" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const admin = await Admin.findByIdAndUpdate(id, parsed.data, {
      returnDocument: "after",
    }).select("-password");
    if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await logAudit({
      action: "admin.update",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Admin",
      targetId: id,
      metadata: { fields: Object.keys(parsed.data) },
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, data: admin });
  } catch {
    return NextResponse.json({ error: "Failed to update admin" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAdmin(["super_admin"]);
  if (response) return response;

  try {
    const { id } = await params;
    if (id === session.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await logAudit({
      action: "admin.delete",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Admin",
      targetId: id,
      message: `Deleted admin "${admin.username}"`,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete admin" }, { status: 500 });
  }
}
