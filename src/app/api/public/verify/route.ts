import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongodb";
import Donation from "@/models/Donation";
import { sendDonationReceipt } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    // Verify the Razorpay signature.
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const provided = Buffer.from(String(razorpay_signature));
    const expected = Buffer.from(expectedSignature);
    const isAuthentic =
      provided.length === expected.length &&
      crypto.timingSafeEqual(provided, expected);

    if (!isAuthentic) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const donation = await Donation.findOne({
      razorpayOrderId: razorpay_order_id,
    });
    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    // Idempotent: a replayed valid payload must not re-process or re-email.
    if (donation.paymentStatus === "success") {
      return NextResponse.json(
        { success: true, alreadyProcessed: true },
        { status: 200 }
      );
    }

    donation.paymentStatus = "success";
    donation.razorpayPaymentId = razorpay_payment_id;
    donation.razorpaySignature = razorpay_signature;
    await donation.save();

    if (donation.email) {
      // Fire-and-forget so the response isn't blocked on SMTP.
      sendDonationReceipt(donation).catch((e) =>
        console.error("Receipt email failed:", e)
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
