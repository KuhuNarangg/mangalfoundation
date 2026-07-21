"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UploadCloud, Loader2 } from "lucide-react";
import { uploadFiles, type UploadedMedia } from "@/lib/upload-client";

export type { UploadedMedia };

export function CloudinaryUpload({
  folder = "mangal",
  multiple = false,
  accept = "image/*,video/*",
  onUploaded,
  label = "Upload",
}: {
  folder?: string;
  multiple?: boolean;
  accept?: string;
  onUploaded: (media: UploadedMedia[]) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const results = await uploadFiles(Array.from(files), folder);
      onUploaded(results);
      toast.success(`Uploaded ${results.length} file${results.length > 1 ? "s" : ""}`);
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <UploadCloud className="h-4 w-4 mr-2" />
        )}
        {uploading ? "Uploading..." : label}
      </Button>
    </>
  );
}
