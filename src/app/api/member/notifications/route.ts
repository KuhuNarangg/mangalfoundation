import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getPublicSession } from "@/lib/public-auth";

export async function GET(req: Request) {
  try {
    const session = await getPublicSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    
    const user = await User.findById(session.id).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const roles = user.roles || [];

    // Find notifications that are either global, target the user's role, or specifically target the user
    const notifications = await Notification.find({
      $or: [
        { isGlobal: true },
        { targetRoles: { $in: roles } },
        { recipients: session.id }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
