import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getPublicSession } from "@/lib/public-auth";
import { signUploadParams, cloudinaryConfig, isCloudinaryConfigured } from "@/lib/cloudinary";

export async function POST(req: Request) {
  const adminSession = await getAdminSession();
  const publicSession = await getPublicSession();
  
  if (!adminSession && !publicSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary is not configured on the server" },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    let folder = formData.get("folder") as string;
    if (!folder) folder = "mangal";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const signature = signUploadParams({ folder, timestamp });
    const { cloudName, apiKey } = cloudinaryConfig();

    const cloudFormData = new FormData();
    cloudFormData.append("file", file);
    cloudFormData.append("api_key", apiKey);
    cloudFormData.append("timestamp", String(timestamp));
    cloudFormData.append("signature", signature);
    cloudFormData.append("folder", folder);

    const up = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: "POST",
        body: cloudFormData,
      }
    );

    const data = await up.json();
    if (!up.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Upload failed at Cloudinary" },
        { status: up.status }
      );
    }

    return NextResponse.json({
      url: data.secure_url,
      publicId: data.public_id,
      resourceType: data.resource_type,
      width: data.width,
      height: data.height,
      format: data.format,
    });
  } catch (err: any) {
    console.error("Upload proxy error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
