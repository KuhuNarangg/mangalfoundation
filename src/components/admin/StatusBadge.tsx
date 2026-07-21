const MAP: Record<string, string> = {
  success:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  refunded:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
        MAP[status] || MAP.pending
      }`}
    >
      {(status || "").toUpperCase()}
    </span>
  );
}
