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
  const results: UploadedMedia[] = [];

  for (const file of files) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);

    let up: Response;
    try {
      up = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
    } catch (err: any) {
      throw new Error(`Upload proxy fetch failed: ${err.message || String(err)}`);
    }

    let data;
    try {
      data = await up.json();
    } catch (err: any) {
      throw new Error(`Failed to parse upload response: ${err.message}. Status: ${up.status}`);
    }

    if (!up.ok) {
      throw new Error(data.error || "Upload failed on the server");
    }

    results.push({
      url: data.url,
      publicId: data.publicId,
      resourceType: data.resourceType,
      width: data.width,
      height: data.height,
      format: data.format,
    });
  }
  return results;
}
