import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Donation from "@/models/Donation";
import "@/models/Category";
import "@/models/Package";
import { requireAdmin } from "@/lib/auth";
import { sendDonationReceipt } from "@/lib/email";
import { generateReceiptNumber } from "@/lib/receipt";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAdmin(["super_admin", "admin", "editor"]);
  if (response) return response;

  try {
    const { id } = await params;
    await connectToDatabase();
    const donation = await Donation.findById(id)
      .populate("categoryId", "title")
      .populate("packageId", "title");
    if (!donation) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (donation.paymentStatus !== "success") {
      return NextResponse.json(
        { error: "Only successful donations have receipts" },
        { status: 400 }
      );
    }
    if (!donation.email) {
      return NextResponse.json(
        { error: "No email address on file for this donation" },
        { status: 400 }
      );
    }

    // Ensure a receipt number exists (older records may predate numbering).
    if (!donation.receiptNumber) {
      donation.receiptNumber = await generateReceiptNumber(new Date(donation.createdAt));
      await donation.save({ timestamps: false });
    }

    const ok = await sendDonationReceipt(donation);

    await logAudit({
      action: "donation.receipt_resend",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Donation",
      targetId: id,
      message: ok ? `Resent receipt to ${donation.email}` : "Receipt email not configured",
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({
      success: ok,
      message: ok ? "Receipt emailed to donor" : "Email is not configured on the server",
    });
  } catch {
    return NextResponse.json({ error: "Failed to resend receipt" }, { status: 500 });
  }
}
