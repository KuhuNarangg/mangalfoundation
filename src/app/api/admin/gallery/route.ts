import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectToDatabase();
    const items = await Gallery.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: items });
  } catch {
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { session, response } = await requireAdmin(["super_admin", "admin", "editor"]);
  if (response) return response;

  try {
    const body = await req.json().catch(() => ({}));
    const rawItems = Array.isArray(body.items) ? body.items : [body];
    const docs = rawItems
      .filter((i: any) => i && typeof i.url === "string")
      .map((i: any) => ({
        title: i.title || "",
        description: i.description || "",
        category: i.category || "",
        url: i.url,
        publicId: i.publicId || "",
        resourceType: i.resourceType === "video" ? "video" : "image",
        width: i.width,
        height: i.height,
      }));

    if (!docs.length) {
      return NextResponse.json({ error: "No valid media" }, { status: 400 });
    }

    await connectToDatabase();
    const created = await Gallery.insertMany(docs);

    await logAudit({
      action: "gallery.upload",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Gallery",
      message: `Uploaded ${created.length} item(s)`,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save gallery items" }, { status: 500 });
  }
}
