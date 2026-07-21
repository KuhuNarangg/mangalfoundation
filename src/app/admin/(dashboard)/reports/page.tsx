"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BarChart, CategoryBars, ProgressRing } from "@/components/admin/AnalyticsCharts";
import { formatINR } from "@/lib/format";
import { downloadCSV, printHTML } from "@/lib/export";
import { Download, Printer } from "lucide-react";

const RANGES = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
  { key: "all", label: "All" },
];

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("all");

  const load = useCallback(async (r: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/dashboard?range=${r}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(range);
  }, [range, load]);

  const exportCSV = () => {
    if (!data?.categoryBudgets?.length) return;
    downloadCSV(
      "mgf-report.csv",
      data.categoryBudgets.map((c: any) => ({
        Category: c.title,
        Target: c.effectiveTarget,
        RaisedThisMonth: c.raised,
        Remaining: c.remaining,
        Progress: `${c.progress}%`,
      }))
    );
  };

  const printReport = () => {
    if (!data) return;
    const rows = (data.categoryBudgets || [])
      .map(
        (c: any) =>
          `<tr><td>${c.title}</td><td>${formatINR(c.effectiveTarget)}</td><td>${formatINR(
            c.raised
          )}</td><td>${formatINR(c.remaining)}</td><td>${c.progress}%</td></tr>`
      )
      .join("");
    printHTML(
      "MGF Donations Report",
      `<h1>Mangal Guruji Foundation — Donations Report</h1>
       <p>Total collected (all time): <b>${formatINR(data.totalAmount)}</b> ·
       Successful: ${data.successfulDonations} · Unique donors: ${data.uniqueDonors}</p>
       <table><thead><tr><th>Category</th><th>Target</th><th>Raised (Month)</th><th>Remaining</th><th>Progress</th></tr></thead><tbody>${rows}</tbody></table>`
    );
  };

  const cards = data
    ? [
        { title: "Total (all time)", value: formatINR(data.totalAmount) },
        { title: `Collected (${RANGES.find((x) => x.key === range)?.label})`, value: formatINR(data.rangeAmount), sub: `${data.rangeCount} donations` },
        { title: "This Month", value: formatINR(data.monthAmount), sub: `${data.monthCount} donations` },
        { title: "Unique Donors", value: data.uniqueDonors },
        { title: "Successful", value: data.successfulDonations },
        { title: "Anonymous", value: data.anonymousDonations },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-lg">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  range === r.key ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={printReport}>
            <Printer className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </div>

      {loading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((s, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">{s.title}</div>
                  <div className="text-2xl font-bold mt-1">{s.value}</div>
                  {s.sub && <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={(data.monthlySeries || []).map((m: any) => ({ label: m.month, value: m.amount }))} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Budget Usage</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <ProgressRing progress={data.budgetUsage?.progress || 0} label="of target" />
                <div className="text-center text-sm">
                  <p><span className="font-semibold">{formatINR(data.budgetUsage?.totalRaised)}</span> raised this month</p>
                  <p className="text-muted-foreground">of {formatINR(data.budgetUsage?.totalTarget)} target</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown (This Month)</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryBars data={data.categoryBreakdown || []} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
