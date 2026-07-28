import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import OTP from "@/models/OTP";
import { sendOTPEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    await connectToDatabase();

    // Check rate limiting (60 seconds)
    const existingOTP = await OTP.findOne({ email: normalizedEmail });
    if (existingOTP) {
      const timeSinceLastRequest = Date.now() - existingOTP.lastRequested.getTime();
      if (timeSinceLastRequest < 60000) {
        return NextResponse.json(
          { error: `Please wait ${Math.ceil((60000 - timeSinceLastRequest) / 1000)}s before requesting a new OTP.` },
          { status: 429 }
        );
      }
    }

    // Generate secure 6 digit OTP
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Upsert the OTP document
    await OTP.findOneAndUpdate(
      { email: normalizedEmail },
      { 
        code, 
        expiresAt, 
        attempts: 0, 
        lastRequested: new Date() 
      },
      { upsert: true, new: true }
    );

    // Send the email
    const sent = await sendOTPEmail(normalizedEmail, code);
    if (!sent) {
      return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
