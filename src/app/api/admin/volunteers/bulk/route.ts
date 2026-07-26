import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Volunteer from "@/models/Volunteer";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";
import { sendVolunteerAcceptanceEmail, sendVolunteerRejectionEmail } from "@/lib/email";
import EmailLog from "@/models/EmailLog";
import User from "@/models/User";
import crypto from "crypto";

const STATUS_ACTIONS: Record<string, string> = {
  accept: "Accepted",
  reject: "Rejected",
  in_review: "In Review",
  contacted: "Contacted",
};

export async function POST(req: Request) {
  const { session, response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const body = await req.json().catch(() => null);
    const action = body?.action as string;
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];
    const valid = ids.filter((i) => /^[0-9a-fA-F]{24}$/.test(i));

    if (!valid.length) {
      return NextResponse.json({ error: "No valid ids" }, { status: 400 });
    }

    await connectToDatabase();

    let modified = 0;
    if (action === "delete") {
      const res = await Volunteer.deleteMany({ _id: { $in: valid } });
      modified = res.deletedCount || 0;
    } else if (STATUS_ACTIONS[action]) {
      const volunteersToUpdate = await Volunteer.find({ _id: { $in: valid } });
      
      const res = await Volunteer.updateMany(
        { _id: { $in: valid } },
        { status: STATUS_ACTIONS[action] }
      );
      modified = res.modifiedCount || 0;

      // Send emails if action is accept or reject
      if (action === "accept" || action === "reject") {
        for (const vol of volunteersToUpdate) {
          if (vol.status !== STATUS_ACTIONS[action]) {
            if (action === "accept") {
              
              // Find or create User record to grant Member + Volunteer roles
              const normalizedEmail = vol.email.toLowerCase().trim();
              let user = await User.findOne({ email: normalizedEmail });
              let memberId = undefined;

              if (user) {
                memberId = user.memberId;
                if (!memberId && !user.roles.includes("member")) {
                  const count = await User.countDocuments({ roles: "member" });
                  memberId = `MGF-${1000 + count + 1}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
                }
                await User.updateOne(
                  { email: normalizedEmail },
                  { 
                    $addToSet: { roles: { $each: ["member", "volunteer"] } },
                    $set: { memberId: memberId || user.memberId }
                  }
                );
              } else {
                const count = await User.countDocuments({ roles: "member" });
                memberId = `MGF-${1000 + count + 1}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
                await User.create({
                  email: normalizedEmail,
                  name: vol.fullName,
                  phone: vol.phone,
                  roles: ["user", "member", "volunteer"],
                  memberId,
                });
              }

              const sent = await sendVolunteerAcceptanceEmail(vol);
              await EmailLog.create({
                recipient: vol.email,
                type: "Acceptance",
                subject: "Welcome! Your Volunteer Application is Approved - Mangal Guruji Foundation",
                status: sent ? "Sent" : "Failed",
                error: sent ? "" : "SMTP failure",
              });
            } else if (action === "reject") {
              const sent = await sendVolunteerRejectionEmail(vol);
              await EmailLog.create({
                recipient: vol.email,
                type: "Rejection",
                subject: "Update on your Volunteer Application - Mangal Guruji Foundation",
                status: sent ? "Sent" : "Failed",
                error: sent ? "" : "SMTP failure",
              });
            }
          }
        }
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await logAudit({
      action: `volunteer.bulk_${action}`,
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Volunteer",
      message: `Bulk ${action} on ${modified} application(s)`,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, modified });
  } catch {
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }
}
