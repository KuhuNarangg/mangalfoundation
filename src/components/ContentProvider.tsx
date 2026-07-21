"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_CONTENT, type SiteContentData } from "@/lib/content";

const ContentContext = createContext<SiteContentData>(DEFAULT_CONTENT);

export const useContent = () => useContext(ContentContext);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  // Start from defaults (SSR-safe), then hydrate with any admin overrides.
  const [content, setContent] = useState<SiteContentData>(DEFAULT_CONTENT);

  useEffect(() => {
    fetch("/api/public/content")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data) setContent(j.data);
      })
      .catch(() => {});
  }, []);

  return (
    <ContentContext.Provider value={content}>{children}</ContentContext.Provider>
  );
}
