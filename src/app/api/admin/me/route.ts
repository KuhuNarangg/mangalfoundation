import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const { session, response } = await requireAdmin();
  if (response) return response;

  try {
    await connectToDatabase();
    const admin: any = await Admin.findById(session.id).select("-password").lean();
    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        username: admin?.username || session.username,
        role: admin?.role || session.role,
        name: admin?.name || "",
        email: admin?.email || "",
        lastLoginAt: admin?.lastLoginAt || null,
        lastLoginIp: admin?.lastLoginIp || "",
        lastLoginLocation: admin?.lastLoginLocation || "",
        createdAt: admin?.createdAt || null,
      },
    });
  } catch {
    return NextResponse.json({ success: true, data: session });
  }
}
