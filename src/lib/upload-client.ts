export type UploadedMedia = {
  url: string;
  publicId: string;
  resourceType: string;
  width?: number;
  height?: number;
  format?: string;
};

/** Upload files to Cloudinary using a server-generated signature. */
export async function uploadFiles(
  files: File[],
  folder = "mangal"
): Promise<UploadedMedia[]> {
  const signRes = await fetch("/api/admin/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  const sign = await signRes.json();
  if (!signRes.ok) throw new Error(sign.error || "Failed to authorize upload");

  const results: UploadedMedia[] = [];
  for (const file of files) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", sign.apiKey);
    fd.append("timestamp", String(sign.timestamp));
    fd.append("signature", sign.signature);
    fd.append("folder", sign.folder);

    let up: Response;
    try {
      up = await fetch(
        `https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`,
        { method: "POST", body: fd }
      );
    } catch (err: any) {
      if (err.message === "Load failed" || err.message.includes("fetch")) {
        throw new Error("Network error (Load failed). This is usually caused by an AdBlocker blocking Cloudinary, or a poor internet connection. Please disable AdBlockers and try again.");
      }
      throw err;
    }

    const data = await up.json();
    if (!up.ok) throw new Error(data.error?.message || "Upload failed");
    results.push({
      url: data.secure_url,
      publicId: data.public_id,
      resourceType: data.resource_type,
      width: data.width,
      height: data.height,
      format: data.format,
    });
  }
  return results;
}
