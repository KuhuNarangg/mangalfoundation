"use client";

import { formatINR } from "@/lib/format";

function EmptyChart() {
  return (
    <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
      No data for this period
    </div>
  );
}

export function BarChart({ data }: { data: { label: string; value: number }[] }) {
  if (!data.length) return <EmptyChart />;
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2 h-48 pt-6">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
          <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {formatINR(d.value)}
          </span>
          <div
            className="w-full rounded-t bg-gradient-to-t from-rose-500 to-orange-400 transition-all duration-500 min-h-[2px]"
            style={{ height: `${(d.value / max) * 100}%` }}
          />
          <span className="text-[10px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function CategoryBars({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length) return <EmptyChart />;
  const total = Math.max(1, data.reduce((s, d) => s + d.value, 0));
  const palette = [
    "bg-rose-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-sky-500",
    "bg-violet-500",
  ];
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium">{d.name}</span>
            <span className="text-muted-foreground">{formatINR(d.value)}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${palette[i % palette.length]}`}
              style={{ width: `${(d.value / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProgressRing({ progress, label }: { progress: number; label?: string }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(100, Math.max(0, progress)) / 100) * c;
  return (
    <div className="relative w-36 h-36">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} className="fill-none stroke-muted" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={r}
          className="fill-none stroke-rose-500 transition-all duration-700"
          strokeWidth="9"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{progress}%</span>
        {label && <span className="text-[10px] text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
