import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Donation from "@/models/Donation";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const body = await req.json();
    await connectToDatabase();

    // Create a Razorpay Order
    const options = {
      amount: body.amount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return NextResponse.json({ error: "Failed to create Razorpay order" }, { status: 500 });
    }

    // Save a 'pending' donation in our DB
    const newDonation = await Donation.create({
      ...body,
      paymentStatus: "pending",
      razorpayOrderId: order.id,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Donation initialized", 
      donationId: newDonation._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Donate error:", error);
    return NextResponse.json({ error: "Failed to initialize donation" }, { status: 500 });
  }
}
