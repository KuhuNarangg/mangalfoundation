import Donation from "@/models/Donation";

export type CategoryBudget = {
  monthlyTarget: number;
  emergencyBudget: number;
  carryForward: number;
  effectiveTarget: number;
  raised: number;
  remaining: number;
  progress: number; // 0..100
};

/** First instant of the current calendar month. */
export function startOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Map of categoryId -> sum of successful donations since `since` (default: this month). */
export async function getRaisedByCategory(
  since: Date = startOfMonth()
): Promise<Record<string, number>> {
  const rows = await Donation.aggregate([
    { $match: { paymentStatus: "success", createdAt: { $gte: since } } },
    { $group: { _id: "$categoryId", total: { $sum: "$amount" } } },
  ]);
  const map: Record<string, number> = {};
  for (const r of rows) map[String(r._id)] = r.total;
  return map;
}

/** Derive the full budget picture for a category from its fields + raised amount. */
export function computeBudget(
  cat: { monthlyTarget?: number; emergencyBudget?: number; carryForward?: number },
  raised: number
): CategoryBudget {
  const monthlyTarget = cat.monthlyTarget ?? 0;
  const emergencyBudget = cat.emergencyBudget ?? 0;
  const carryForward = cat.carryForward ?? 0;
  const effectiveTarget = monthlyTarget + emergencyBudget + carryForward;
  const remaining = Math.max(0, effectiveTarget - raised);
  const progress =
    effectiveTarget > 0
      ? Math.min(100, Math.round((raised / effectiveTarget) * 100))
      : 0;
  return {
    monthlyTarget,
    emergencyBudget,
    carryForward,
    effectiveTarget,
    raised,
    remaining,
    progress,
  };
}
