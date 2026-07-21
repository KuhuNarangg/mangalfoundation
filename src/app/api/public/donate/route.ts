import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectToDatabase from "@/lib/mongodb";
import Donation from "@/models/Donation";
import Category from "@/models/Category";
import Package from "@/models/Package";
import { donationInputSchema, formatZodError } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Payment gateway is not configured" },
        { status: 500 }
      );
    }

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = donationInputSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(parsed.error) },
        { status: 400 }
      );
    }
    const data = parsed.data;

    await connectToDatabase();

    // The category must exist and be active.
    const category = await Category.findOne({
      _id: data.categoryId,
      isActive: true,
    }).lean();
    if (!category) {
      return NextResponse.json(
        { error: "Selected cause is unavailable" },
        { status: 400 }
      );
    }

    // If a package was chosen, it must belong to this category and be active.
    let packageId: string | null = null;
    if (data.packageId) {
      const pkg = await Package.findOne({
        _id: data.packageId,
        categoryId: data.categoryId,
        isActive: true,
      }).lean();
      if (!pkg) {
        return NextResponse.json(
          { error: "Selected package is unavailable" },
          { status: 400 }
        );
      }
      packageId = data.packageId;
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: data.amount * 100, // amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { categoryId: data.categoryId, packageId: packageId ?? "custom" },
    });

    if (!order?.id) {
      return NextResponse.json(
        { error: "Failed to create payment order" },
        { status: 502 }
      );
    }

    // Persist only whitelisted fields — status/ids are server-controlled.
    const newDonation = await Donation.create({
      donorName: data.donorName,
      email: data.email,
      phone: data.phone,
      isAnonymous: data.isAnonymous ?? false,
      message: data.message ?? "",
      categoryId: data.categoryId,
      packageId,
      amount: data.amount,
      paymentStatus: "pending",
      razorpayOrderId: order.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Donation initialized",
        donationId: newDonation._id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Donate error:", error);
    return NextResponse.json(
      { error: "Failed to initialize donation" },
      { status: 500 }
    );
  }
}
