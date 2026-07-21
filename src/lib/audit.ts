import connectToDatabase from "./mongodb";
import AuditLog from "@/models/AuditLog";

export type AuditInput = {
  action: string;
  status?: "success" | "failure";
  actorId?: string | null;
  actorUsername?: string;
  targetType?: string;
  targetId?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
};

/** Best-effort audit logging — never throws into the calling request. */
export async function logAudit(input: AuditInput): Promise<void> {
  try {
    await connectToDatabase();
    await AuditLog.create({ status: "success", ...input });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}
