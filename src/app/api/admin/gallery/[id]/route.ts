import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";
import {
  signUploadParams,
  cloudinaryConfig,
  isCloudinaryConfigured,
} from "@/lib/cloudinary";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin(["super_admin", "admin", "editor"]);
  if (response) return response;

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const update: Record<string, unknown> = {};
    if (typeof body.title === "string") update.title = body.title;
    if (typeof body.description === "string") update.description = body.description;
    if (typeof body.category === "string") update.category = body.category;
    if (typeof body.isActive === "boolean") update.isActive = body.isActive;

    await connectToDatabase();
    const item = await Gallery.findByIdAndUpdate(id, update, {
      returnDocument: "after",
    });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: item });
  } catch {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAdmin(["super_admin", "admin", "editor"]);
  if (response) return response;

  try {
    const { id } = await params;
    await connectToDatabase();
    const item = await Gallery.findById(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Best-effort removal from Cloudinary.
    if (item.publicId && isCloudinaryConfigured()) {
      const timestamp = Math.round(Date.now() / 1000);
      const signature = signUploadParams({ public_id: item.publicId, timestamp });
      const { cloudName, apiKey } = cloudinaryConfig();
      const fd = new URLSearchParams({
        public_id: item.publicId,
        api_key: apiKey,
        timestamp: String(timestamp),
        signature,
      });
      await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${item.resourceType}/destroy`,
        { method: "POST", body: fd }
      ).catch(() => {});
    }

    await Gallery.findByIdAndDelete(id);

    await logAudit({
      action: "gallery.delete",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Gallery",
      targetId: id,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
