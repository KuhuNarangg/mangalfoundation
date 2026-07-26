import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  const { response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    await connectToDatabase();
    const notifications = await Notification.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { session, response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const { title, message, type, isGlobal, targetRoles } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const notification = await Notification.create({
      title,
      message,
      type: type || "announcement",
      isGlobal,
      targetRoles: isGlobal ? [] : targetRoles,
      createdBy: session.id,
    });

    return NextResponse.json({ success: true, data: notification });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}
