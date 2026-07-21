import Counter from "@/models/Counter";

/**
 * Generate a unique, sequential receipt number like `MGF/2026/00001`.
 * Uses an atomic per-year counter so numbers never collide.
 * Caller must have an active DB connection.
 */
export async function generateReceiptNumber(date = new Date()): Promise<string> {
  const year = date.getFullYear();
  const counter = await Counter.findByIdAndUpdate(
    `receipt-${year}`,
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true }
  );
  const seq = String(counter?.seq ?? 1).padStart(5, "0");
  return `MGF/${year}/${seq}`;
}

/** Human labels for stored payment-method codes. */
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  cheque: "Cheque",
  bank_transfer: "Bank Transfer",
  upi: "UPI",
  other: "Other",
  razorpay: "Online (Razorpay)",
};

export function paymentMethodLabel(donation: {
  source?: string;
  paymentMethod?: string;
}): string {
  if (donation.source === "manual") {
    return PAYMENT_METHOD_LABELS[donation.paymentMethod || "other"] || "Offline";
  }
  return "Online (Razorpay)";
}
