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
  let signRes: Response;
  try {
    signRes = await fetch("/api/admin/upload/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder }),
    });
  } catch (err: any) {
    throw new Error(`Sign fetch failed: ${err.message || String(err)}`);
  }

  let sign;
  try {
    sign = await signRes.json();
  } catch (err: any) {
    throw new Error(`Failed to parse sign response: ${err.message}. Status: ${signRes.status}`);
  }

  if (!signRes.ok) throw new Error(sign.error || "Failed to authorize upload");
  if (!sign.cloudName) throw new Error("Cloudinary cloudName is missing from server response");

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
      throw new Error(`Cloudinary fetch failed: ${err.message || String(err)}. CloudName: ${sign.cloudName}`);
    }

    let data;
    try {
      data = await up.json();
    } catch (err: any) {
      throw new Error(`Failed to parse Cloudinary response: ${err.message}. Status: ${up.status}`);
    }

    if (!up.ok) throw new Error(data.error?.message || "Upload failed at Cloudinary");
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
