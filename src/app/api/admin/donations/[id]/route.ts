import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Donation from "@/models/Donation";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";

const STATUSES = ["pending", "success", "failed", "refunded"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const paymentStatus = body.paymentStatus;
    if (!STATUSES.includes(paymentStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectToDatabase();
    const donation = await Donation.findByIdAndUpdate(
      id,
      { paymentStatus },
      { returnDocument: "after" }
    );
    if (!donation) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await logAudit({
      action: "donation.update",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Donation",
      targetId: id,
      message: `Set status to ${paymentStatus}`,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, data: donation });
  } catch {
    return NextResponse.json({ error: "Failed to update donation" }, { status: 500 });
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
    const donation = await Donation.findByIdAndDelete(id);
    if (!donation) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await logAudit({
      action: "donation.delete",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Donation",
      targetId: id,
      message: `Deleted donation of ₹${donation.amount}`,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete donation" }, { status: 500 });
  }
}
