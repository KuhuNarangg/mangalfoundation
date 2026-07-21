import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Donation from "@/models/Donation";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/auth";
import { getRaisedByCategory, computeBudget, startOfMonth } from "@/lib/budget";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function rangeStart(range: string): Date | null {
  const now = new Date();
  switch (range) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "year":
      return new Date(now.getFullYear(), 0, 1);
    default:
      return null; // "all"
  }
}

export async function GET(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "all";
    const start = rangeStart(range);
    const successMatch: Record<string, unknown> = { paymentStatus: "success" };
    const rangeMatch = start
      ? { paymentStatus: "success", createdAt: { $gte: start } }
      : successMatch;

    await connectToDatabase();

    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startMonth = startOfMonth();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      statusCounts,
      totalAmountAgg,
      rangeAgg,
      todayAgg,
      monthAgg,
      uniqueDonorsAgg,
      anonymousDonations,
      activeCategoryDocs,
      recentDonations,
      monthlyRows,
      categoryRows,
      raisedMap,
    ] = await Promise.all([
      Donation.aggregate([{ $group: { _id: "$paymentStatus", n: { $sum: 1 } } }]),
      Donation.aggregate([
        { $match: successMatch },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Donation.aggregate([
        { $match: rangeMatch },
        { $group: { _id: null, total: { $sum: "$amount" }, n: { $sum: 1 } } },
      ]),
      Donation.aggregate([
        { $match: { paymentStatus: "success", createdAt: { $gte: startToday } } },
        { $group: { _id: null, total: { $sum: "$amount" }, n: { $sum: 1 } } },
      ]),
      Donation.aggregate([
        { $match: { paymentStatus: "success", createdAt: { $gte: startMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" }, n: { $sum: 1 } } },
      ]),
      Donation.aggregate([
        { $match: successMatch },
        { $group: { _id: "$email" } },
        { $count: "n" },
      ]),
      Donation.countDocuments({ paymentStatus: "success", isAnonymous: true }),
      Category.find({ isActive: true }).lean(),
      Donation.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("categoryId", "title")
        .lean(),
      Donation.aggregate([
        { $match: { paymentStatus: "success", createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
            total: { $sum: "$amount" },
            n: { $sum: 1 },
          },
        },
        { $sort: { "_id.y": 1, "_id.m": 1 } },
      ]),
      Donation.aggregate([
        { $match: { paymentStatus: "success", createdAt: { $gte: startMonth } } },
        { $group: { _id: "$categoryId", total: { $sum: "$amount" } } },
      ]),
      getRaisedByCategory(),
    ]);

    const counts: Record<string, number> = {
      success: 0,
      pending: 0,
      failed: 0,
      refunded: 0,
    };
    for (const s of statusCounts) counts[s._id] = s.n;
    const totalDonations =
      counts.success + counts.pending + counts.failed + counts.refunded;

    // Budget usage across all active categories.
    let totalTarget = 0;
    let totalRaisedMonth = 0;
    const categoryBudgets = activeCategoryDocs.map((c) => {
      const b = computeBudget(c, raisedMap[c._id.toString()] || 0);
      totalTarget += b.effectiveTarget;
      totalRaisedMonth += b.raised;
      return { id: c._id.toString(), title: c.title, ...b };
    });

    const catTitle = new Map(
      activeCategoryDocs.map((c) => [c._id.toString(), c.title])
    );
    const categoryBreakdown = categoryRows.map((cb) => ({
      name: catTitle.get(String(cb._id)) || "Other",
      value: cb.total,
    }));

    const monthlySeries = monthlyRows.map((ms) => ({
      month: MONTHS[ms._id.m - 1],
      amount: ms.total,
      count: ms.n,
    }));

    return NextResponse.json({
      success: true,
      data: {
        range,
        totalAmount: totalAmountAgg[0]?.total || 0,
        rangeAmount: rangeAgg[0]?.total || 0,
        rangeCount: rangeAgg[0]?.n || 0,
        todayAmount: todayAgg[0]?.total || 0,
        todayCount: todayAgg[0]?.n || 0,
        monthAmount: monthAgg[0]?.total || 0,
        monthCount: monthAgg[0]?.n || 0,
        totalDonations,
        successfulDonations: counts.success,
        pendingDonations: counts.pending,
        failedDonations: counts.failed,
        refundedDonations: counts.refunded,
        uniqueDonors: uniqueDonorsAgg[0]?.n || 0,
        anonymousDonations,
        activeCategories: activeCategoryDocs.length,
        budgetUsage: {
          totalTarget,
          totalRaised: totalRaisedMonth,
          remaining: Math.max(0, totalTarget - totalRaisedMonth),
          progress:
            totalTarget > 0
              ? Math.round((totalRaisedMonth / totalTarget) * 100)
              : 0,
        },
        categoryBudgets,
        categoryBreakdown,
        monthlySeries,
        recentDonations,
      },
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
