"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type Media = {
  url: string;
  resourceType?: string;
  title?: string;
};

const FALLBACK: Media[] = [
  { url: "/images/joel-muniz-qvzjG2pF4bE-unsplash.jpg", resourceType: "image" },
  { url: "/images/nico-smit-NFoerQuvzrs-unsplash.jpg", resourceType: "image" },
  { url: "/images/srimathi-jayaprakash-uO1MUMn0Xzc-unsplash.jpg", resourceType: "image" },
  { url: "/images/larm-rmah-AEaTUnvneik-unsplash.jpg", resourceType: "image" },
];

/** Insert Cloudinary auto-format/quality transforms for lighter delivery. */
function optimize(url: string, w = 800): string {
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${w}/`);
  }
  return url;
}

export function Gallery() {
  const [items, setItems] = useState<Media[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);
  const [lightbox, setLightbox] = useState<Media | null>(null);

  const load = useCallback(async (p: number) => {
    try {
      const res = await fetch(`/api/public/gallery?page=${p}&limit=12`);
      const json = await res.json();
      if (json.success) {
        if (p === 1 && json.data.length === 0) {
          setItems(FALLBACK);
          setUsedFallback(true);
        } else {
          setItems((prev) => (p === 1 ? json.data : [...prev, ...json.data]));
          setPages(json.pagination.pages);
        }
      }
    } catch {
      setItems(FALLBACK);
      setUsedFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const loadMore = () => {
    const np = page + 1;
    setPage(np);
    load(np);
  };

  return (
    <section id="gallery" className="py-16 bg-[#111] border-b border-[#222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.h2 className="font-heading text-3xl md:text-5xl text-white mb-4">
              Moments of Hope
            </motion.h2>
            <p className="text-base text-gray-400 font-light">
              A glimpse into the lives we touch and the smiles we help create every single day.
            </p>
          </div>
        </div>

        {loading && items.length === 0 ? (
          <div className="text-center text-gray-500 py-12">Loading gallery…</div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 [&>*]:mb-4">
            {items.map((it, i) => (
              <button
                key={i}
                type="button"
                onClick={() => !usedFallback && setLightbox(it)}
                className="block w-full break-inside-avoid overflow-hidden rounded-lg group relative bg-[#1a1a1a]"
              >
                {it.resourceType === "video" ? (
                  <video
                    src={it.url}
                    className="w-full"
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={optimize(it.url)}
                    alt={it.title || "Gallery moment"}
                    loading="lazy"
                    decoding="async"
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {!usedFallback && page < pages && (
          <div className="text-center mt-10">
            <button
              onClick={loadMore}
              className="px-8 py-3 border border-white/30 text-white rounded-full text-sm font-medium tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/80 hover:text-white"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <X className="h-8 w-8" />
          </button>
          <div className="max-w-5xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            {lightbox.resourceType === "video" ? (
              <video src={lightbox.url} className="max-h-[85vh] rounded-lg" controls autoPlay />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={optimize(lightbox.url, 1600)}
                alt={lightbox.title || "Gallery moment"}
                className="max-h-[85vh] rounded-lg object-contain"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
