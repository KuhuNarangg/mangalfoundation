import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Donation from "@/models/Donation";
import Category from "@/models/Category";
import Package from "@/models/Package";

export async function GET() {
  try {
    await connectToDatabase();

    const [
      totalDonations,
      pendingDonations,
      successfulDonations,
      totalAmountResult,
      totalCategories,
      totalPackages,
      recentDonations,
    ] = await Promise.all([
      Donation.countDocuments(),
      Donation.countDocuments({ paymentStatus: "pending" }),
      Donation.countDocuments({ paymentStatus: "success" }),
      Donation.aggregate([
        { $match: { paymentStatus: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Category.countDocuments(),
      Package.countDocuments(),
      Donation.find().sort({ createdAt: -1 }).limit(5).populate("categoryId", "title"),
    ]);

    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalDonations,
        pendingDonations,
        successfulDonations,
        totalAmount,
        totalCategories,
        totalPackages,
        recentDonations,
      },
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
