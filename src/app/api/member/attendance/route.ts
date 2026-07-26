import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import { getPublicSession } from "@/lib/public-auth";

export async function GET(req: Request) {
  try {
    const session = await getPublicSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") ? new Date(searchParams.get("month")!) : new Date();
    
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);

    await connectToDatabase();
    const records = await Attendance.find({
      userId: session.id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ date: -1 }).lean();

    return NextResponse.json({ data: records });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getPublicSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, notes } = await req.json(); // "check-in" or "check-out"
    if (!action) return NextResponse.json({ error: "Action is required" }, { status: 400 });

    await connectToDatabase();
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    let record = await Attendance.findOne({
      userId: session.id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (action === "check-in") {
      if (record && record.checkIn) {
        return NextResponse.json({ error: "Already checked in today" }, { status: 400 });
      }
      if (!record) {
        record = new Attendance({
          userId: session.id,
          date: startOfDay,
          checkIn: now,
          status: "present",
        });
      } else {
        record.checkIn = now;
        record.status = "present";
      }
    } else if (action === "check-out") {
      if (!record || !record.checkIn) {
        return NextResponse.json({ error: "You must check in first" }, { status: 400 });
      }
      if (record.checkOut) {
        return NextResponse.json({ error: "Already checked out today" }, { status: 400 });
      }
      record.checkOut = now;
      // Calculate total hours
      const diffMs = now.getTime() - record.checkIn.getTime();
      record.totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
      if (notes) record.notes = notes;
    }

    await record.save();
    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Attendance record already exists for today" }, { status: 400 });
    }
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
