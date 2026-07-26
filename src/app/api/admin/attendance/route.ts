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

export async function POST(req: Request) {
  const { response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const { recordId, action } = await req.json();
    if (action !== "check-out") return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    await connectToDatabase();
    
    const record = await Attendance.findById(recordId);
    if (!record) return NextResponse.json({ error: "Record not found" }, { status: 404 });
    if (record.checkOut) return NextResponse.json({ error: "Already checked out" }, { status: 400 });

    const now = new Date();
    record.checkOut = now;
    const diffMs = now.getTime() - record.checkIn.getTime();
    record.totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    
    await record.save();
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 });
  }
}
