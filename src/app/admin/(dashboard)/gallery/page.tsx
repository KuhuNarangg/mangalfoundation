"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadFiles } from "@/lib/upload-client";
import { UploadCloud, Trash2, Loader2, Film } from "lucide-react";

export default function GalleryAdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/gallery");
      const json = await res.json();
      if (json.success) setItems(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const doUpload = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const media = await uploadFiles(files, "mangal/gallery");
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: media }),
      });
      if (res.ok) {
        toast.success(`Uploaded ${media.length} item${media.length > 1 ? "s" : ""}`);
        load();
      } else {
        toast.error("Failed to save media");
      }
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this media?")) return;
    const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted");
      load();
    } else {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Gallery</h1>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          doUpload(Array.from(e.dataTransfer.files));
        }}
        className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
          dragOver ? "border-rose-500 bg-rose-50 dark:bg-rose-950/20" : "border-border"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => doUpload(Array.from(e.target.files || []))}
        />
        {uploading ? (
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-rose-500" />
        ) : (
          <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground" />
        )}
        <p className="mt-3 text-sm text-muted-foreground">
          Drag &amp; drop images or videos here, or
        </p>
        <Button
          className="mt-3"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          Browse Files
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No media yet.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((it) => (
            <div
              key={it._id}
              className="group relative aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              {it.resourceType === "video" ? (
                <video src={it.url} className="w-full h-full object-cover" muted />
              ) : (
                <Image src={it.url} alt={it.title || "Gallery"} fill sizes="300px" className="object-cover" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button variant="destructive" size="icon" onClick={() => remove(it._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {it.resourceType === "video" && (
                <div className="absolute top-2 left-2 bg-black/60 text-white rounded p-1">
                  <Film className="h-3 w-3" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
