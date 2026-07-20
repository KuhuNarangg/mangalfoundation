import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Donation from "@/models/Donation";
import Category from "@/models/Category";
import Package from "@/models/Package";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    await connectToDatabase();

    const query: any = {};
    if (status) {
      query.paymentStatus = status;
    }

    const donations = await Donation.find(query)
      .populate("categoryId", "title")
      .populate("packageId", "title")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: donations });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 });
  }
}
