import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { createPublicSession } from "@/lib/public-auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, password, loginRole } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const normalizedUsername = username.toLowerCase().trim();
    await connectToDatabase();

    // Find user by either email or memberId
    const user = await User.findOne({
      $or: [
        { email: normalizedUsername },
        { memberId: username.trim() } // memberId might be uppercase
      ]
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check if they are actually a member/volunteer
    if (loginRole === "member" && !user.roles.includes("member")) {
      return NextResponse.json({ error: "This account does not have Member access." }, { status: 403 });
    }
    if (loginRole === "volunteer" && !user.roles.includes("volunteer")) {
      return NextResponse.json({ error: "This account does not have Volunteer access." }, { status: 403 });
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json({ error: "No password set for this account. Please contact admin." }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Issue JWT cookie
    await createPublicSession({ _id: user._id.toString(), email: user.email });

    return NextResponse.json({ success: true, message: "Logged in successfully" });
  } catch (error) {
    console.error("Password login error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
