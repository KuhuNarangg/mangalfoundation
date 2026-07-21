import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Volunteer from "@/models/Volunteer";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";

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
      const res = await Volunteer.updateMany(
        { _id: { $in: valid } },
        { status: STATUS_ACTIONS[action] }
      );
      modified = res.modifiedCount || 0;
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
