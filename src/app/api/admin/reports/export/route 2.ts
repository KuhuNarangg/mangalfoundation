import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Donation from "@/models/Donation";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  const { response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "attendance" or "donations"

    await connectToDatabase();
    
    if (type === "attendance") {
      const records = await Attendance.find()
        .populate("userId", "name email roles")
        .sort({ date: -1 })
        .lean();
      
      const csv = [
        ["Date", "Member Name", "Email", "Role", "Check In", "Check Out", "Total Hours"].join(","),
        ...records.map((r: any) => [
          new Date(r.date).toLocaleDateString(),
          r.userId?.name || "",
          r.userId?.email || "",
          r.userId?.roles?.[0] || "",
          r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "",
          r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "",
          r.totalHours || ""
        ].map(s => `"${s}"`).join(","))
      ].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="attendance_report_${Date.now()}.csv"`,
        }
      });
    }

    if (type === "donations") {
      const records = await Donation.find({ paymentStatus: "paid" })
        .sort({ createdAt: -1 })
        .lean();
      
      const csv = [
        ["Date", "Donor Name", "Email", "Amount", "PAN", "Transaction ID"].join(","),
        ...records.map((r: any) => [
          new Date(r.createdAt).toLocaleDateString(),
          r.donorName || "",
          r.email || "",
          r.amount || "",
          r.panNumber || "",
          r.transactionId || ""
        ].map(s => `"${s}"`).join(","))
      ].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="donations_report_${Date.now()}.csv"`,
        }
      });
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
