import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import SiteContent from "@/models/SiteContent";
import { mergeContent } from "@/lib/content";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectToDatabase();
    const doc: any = await SiteContent.findById("singleton").lean();
    return NextResponse.json({ success: true, data: mergeContent(doc?.data) });
  } catch {
    return NextResponse.json({ success: true, data: mergeContent(null) });
  }
}

export async function PUT(req: Request) {
  const { session, response } = await requireAdmin(["super_admin", "admin", "editor"]);
  if (response) return response;

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    await connectToDatabase();
    await SiteContent.findByIdAndUpdate(
      "singleton",
      { data: body },
      { upsert: true, returnDocument: "after" }
    );

    await logAudit({
      action: "content.update",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "SiteContent",
      message: "Updated website content",
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, data: mergeContent(body) });
  } catch {
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
