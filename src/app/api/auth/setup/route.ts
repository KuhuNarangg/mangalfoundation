import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { setupSchema, formatZodError } from "@/lib/validations";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";

export async function POST(req: Request) {
  try {
    // Optional shared-secret guard so the bootstrap endpoint can't be seized
    // by whoever reaches the deployment first.
    const setupSecret = process.env.SETUP_SECRET;
    if (setupSecret && req.headers.get("x-setup-secret") !== setupSecret) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = setupSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(parsed.error) },
        { status: 400 }
      );
    }
    const { username, password } = parsed.data;

    await connectToDatabase();

    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin already exists. Setup is disabled." },
        { status: 403 }
      );
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      username,
      password: hashedPassword,
      role: "super_admin",
    });

    await logAudit({
      action: "auth.setup",
      actorId: admin._id?.toString(),
      actorUsername: username,
      message: "Initial super admin created",
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json(
      { success: true, message: "Admin created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
