import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import OTP from "@/models/OTP";
import User from "@/models/User";
import { createPublicSession } from "@/lib/public-auth";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    await connectToDatabase();

    const otpDoc = await OTP.findOne({ email: normalizedEmail });
    if (!otpDoc) {
      return NextResponse.json({ error: "OTP expired or not requested" }, { status: 400 });
    }

    // Check expiration
    if (new Date() > otpDoc.expiresAt) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    // Check max attempts
    if (otpDoc.attempts >= 5) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return NextResponse.json({ error: "Too many failed attempts. Please request a new OTP." }, { status: 429 });
    }

    // Verify code
    if (otpDoc.code !== code.trim()) {
      await OTP.updateOne({ _id: otpDoc._id }, { $inc: { attempts: 1 } });
      return NextResponse.json({ error: `Invalid OTP. ${4 - otpDoc.attempts} attempts remaining.` }, { status: 400 });
    }

    // OTP is valid, get or create the user
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.create({ email: normalizedEmail });
    }

    // Issue JWT cookie
    await createPublicSession({ _id: user._id.toString(), email: user.email });

    // Clean up OTP
    await OTP.deleteOne({ _id: otpDoc._id });

    return NextResponse.json({ success: true, message: "Logged in successfully", user: { email: user.email } });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
