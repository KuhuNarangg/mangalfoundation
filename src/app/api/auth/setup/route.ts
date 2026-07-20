import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    await connectToDatabase();

    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return NextResponse.json({ error: "Admin already exists. Setup is disabled." }, { status: 403 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await Admin.create({
      username,
      password: hashedPassword,
    });

    return NextResponse.json({ success: true, message: "Admin created successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
