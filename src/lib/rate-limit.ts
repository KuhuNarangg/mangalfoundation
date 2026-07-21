import connectToDatabase from "./mongodb";
import RateLimit from "@/models/RateLimit";

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  count: number;
  resetAt: Date;
};

/**
 * Fixed-window rate limiter backed by MongoDB — deployment-agnostic
 * (works on serverless and single-node alike, no Redis required).
 *
 * Each time window becomes its own document with a TTL, so old buckets
 * self-expire and the collection never grows unbounded.
 */
export async function rateLimit(
  baseKey: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  await connectToDatabase();

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowId = Math.floor(now / windowMs);
  const key = `${baseKey}:${windowId}`;
  const resetAt = new Date((windowId + 1) * windowMs);
  // Keep the bucket one extra window before the TTL monitor reaps it.
  const expiresAt = new Date((windowId + 2) * windowMs);

  const doc = await RateLimit.findOneAndUpdate(
    { key },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
    { returnDocument: "after", upsert: true }
  );

  return {
    success: doc.count <= limit,
    limit,
    remaining: Math.max(0, limit - doc.count),
    count: doc.count,
    resetAt,
  };
}
