import { NextResponse } from "next/server";
import { z } from "zod";
import connectToDatabase from "@/lib/mongodb";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";
import { formatZodError } from "@/lib/validations";

const budgetOpSchema = z
  .object({
    op: z.enum([
      "increase",
      "decrease",
      "set",
      "reset",
      "emergency",
      "carryforward",
    ]),
    amount: z.number().min(0).max(1_000_000_000).optional(),
  })
  .refine((d) => d.op === "reset" || typeof d.amount === "number", {
    message: "amount is required for this operation",
    path: ["amount"],
  });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const { id } = await params;

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = budgetOpSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(parsed.error) },
        { status: 400 }
      );
    }
    const { op, amount = 0 } = parsed.data;

    await connectToDatabase();
    const category = await Category.findById(id);
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

    switch (op) {
      case "increase":
        category.monthlyTarget = (category.monthlyTarget || 0) + amount;
        break;
      case "decrease":
        category.monthlyTarget = Math.max(0, (category.monthlyTarget || 0) - amount);
        break;
      case "set":
        category.monthlyTarget = amount;
        break;
      case "emergency":
        category.emergencyBudget = (category.emergencyBudget || 0) + amount;
        break;
      case "carryforward":
        category.carryForward = (category.carryForward || 0) + amount;
        break;
      case "reset":
        category.emergencyBudget = 0;
        category.carryForward = 0;
        break;
    }

    await category.save();

    await logAudit({
      action: `budget.${op}`,
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Category",
      targetId: id,
      message: `Budget ${op} on "${category.title}"`,
      metadata: {
        op,
        amount,
        monthlyTarget: category.monthlyTarget,
        emergencyBudget: category.emergencyBudget,
        carryForward: category.carryForward,
      },
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, data: category });
  } catch {
    return NextResponse.json({ error: "Failed to update budget" }, { status: 500 });
  }
}
