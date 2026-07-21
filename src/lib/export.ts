/** Trigger a client-side CSV download (Excel-compatible). */
export function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
  ].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Open a clean printable window (browser "Save as PDF") with the given table HTML. */
export function printHTML(title: string, bodyHtml: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(
    `<html><head><title>${title}</title><style>` +
      `body{font-family:system-ui,sans-serif;padding:24px;color:#111}` +
      `h1{font-size:18px;margin-bottom:16px}` +
      `table{width:100%;border-collapse:collapse}` +
      `th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}` +
      `th{background:#f5f5f5}` +
      `</style></head><body>${bodyHtml}` +
      `<script>window.onload=function(){window.print()}</script></body></html>`
  );
  w.document.close();
}
