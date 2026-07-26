import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  const { response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const date = dateStr ? new Date(dateStr) : new Date();
    
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

    await connectToDatabase();
    
    const records = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    })
    .populate("userId", "name email memberId profilePicture roles")
    .sort({ checkIn: -1 })
    .lean();

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 });
  }
}
