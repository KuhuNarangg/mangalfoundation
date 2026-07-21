import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const isRead = Boolean(body.isRead);

    await connectToDatabase();
    const contact = await Contact.findByIdAndUpdate(
      id,
      { isRead },
      { returnDocument: "after" }
    );
    if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: contact });
  } catch {
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
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
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await logAudit({
      action: "contact.delete",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Contact",
      targetId: id,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
