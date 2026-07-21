import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectToDatabase from "@/lib/mongodb";
import Donation from "@/models/Donation";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Payment gateway is not configured" },
        { status: 500 }
      );
    }

    const { id } = await params;
    await connectToDatabase();
    const donation = await Donation.findById(id);
    if (!donation) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (donation.paymentStatus !== "success") {
      return NextResponse.json(
        { error: "Only successful donations can be refunded" },
        { status: 400 }
      );
    }
    if (!donation.razorpayPaymentId) {
      return NextResponse.json(
        { error: "This donation has no payment to refund" },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    try {
      await razorpay.payments.refund(donation.razorpayPaymentId, {
        amount: donation.amount * 100,
      });
    } catch (e) {
      console.error("Razorpay refund error:", e);
      return NextResponse.json(
        { error: "Refund failed at the payment gateway" },
        { status: 502 }
      );
    }

    donation.paymentStatus = "refunded";
    await donation.save();

    await logAudit({
      action: "donation.refund",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Donation",
      targetId: id,
      message: `Refunded ₹${donation.amount}`,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, data: donation });
  } catch {
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 });
  }
}
