import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Volunteer from "@/models/Volunteer";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";
import { volunteerUpdateSchema, formatZodError } from "@/lib/validations";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAdmin(["super_admin", "admin", "editor"]);
  if (response) return response;

  try {
    const { id } = await params;
    const json = await req.json().catch(() => null);
    const parsed = volunteerUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const volunteer = await Volunteer.findByIdAndUpdate(id, parsed.data, {
      returnDocument: "after",
    });
    if (!volunteer) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await logAudit({
      action: "volunteer.update",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Volunteer",
      targetId: id,
      metadata: { fields: Object.keys(parsed.data) },
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, data: volunteer });
  } catch {
    return NextResponse.json({ error: "Failed to update volunteer" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const { id } = await params;
    await connectToDatabase();
    const volunteer = await Volunteer.findByIdAndDelete(id);
    if (!volunteer) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await logAudit({
      action: "volunteer.delete",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Volunteer",
      targetId: id,
      message: `Deleted application from ${volunteer.fullName}`,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete volunteer" }, { status: 500 });
  }
}
