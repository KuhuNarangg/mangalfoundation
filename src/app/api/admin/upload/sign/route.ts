import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { signUploadParams, cloudinaryConfig, isCloudinaryConfigured } from "@/lib/cloudinary";

export async function POST(req: Request) {
  const { response } = await requireAdmin(["super_admin", "admin", "editor"]);
  if (response) return response;

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary is not configured on the server" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const folder =
    typeof body.folder === "string" && body.folder ? body.folder : "mangal";
  const timestamp = Math.round(Date.now() / 1000);
  const signature = signUploadParams({ folder, timestamp });
  const { cloudName, apiKey } = cloudinaryConfig();

  return NextResponse.json({ signature, timestamp, apiKey, cloudName, folder });
}
