import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import EmailLog from "@/models/EmailLog";
import { requireAdmin } from "@/lib/auth";
import { sendMemberWelcomeEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";
import bcrypt from "bcryptjs";

// Helper to generate a random 5-digit password
const generatePassword = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

export async function POST(req: Request) {
  const { session, response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only allow for team members (members, volunteers, etc)
    if (!user.roles.includes("member") && !user.roles.includes("volunteer")) {
      return NextResponse.json({ error: "Cannot reset password for donors. Use OTP." }, { status: 400 });
    }

    const rawPassword = generatePassword();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    user.password = hashedPassword;
    await user.save();

    // Send the email with the new credentials
    const sent = await sendMemberWelcomeEmail(user.email, user.name || "Team Member", rawPassword);
    
    await EmailLog.create({
      recipient: user.email,
      type: "PasswordReset",
      subject: "Your New Account Credentials",
      status: sent ? "Sent" : "Failed",
      error: sent ? "" : "SMTP failure",
    });

    if (!sent) {
       return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    await logAudit({
      action: "user.reset_password",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "User",
      targetId: user._id.toString(),
      message: `Reset password for ${user.email}`,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, message: "New password generated and sent to user." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
