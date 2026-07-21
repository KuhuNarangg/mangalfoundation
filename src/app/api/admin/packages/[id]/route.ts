import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Package from "@/models/Package";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";
import { packageUpdateSchema, formatZodError } from "@/lib/validations";

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

    const parsed = packageUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const updatedPackage = await Package.findByIdAndUpdate(id, parsed.data, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!updatedPackage)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await logAudit({
      action: "package.update",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Package",
      targetId: id,
      message: `Updated package "${updatedPackage.title}"`,
      metadata: { fields: Object.keys(parsed.data) },
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, data: updatedPackage });
  } catch {
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
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
    const deletedPackage = await Package.findByIdAndDelete(id);
    if (!deletedPackage)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await logAudit({
      action: "package.delete",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Package",
      targetId: id,
      message: `Deleted package "${deletedPackage.title}"`,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete package" }, { status: 500 });
  }
}
