"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DonationDetailDialog } from "@/components/admin/DonationDetailDialog";
import { formatINR } from "@/lib/format";
import { ReceiptIndianRupee, ChevronRight } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<any>(null);

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const categories = data.categoryBudgets || [];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      {/* The one headline: total donations */}
      <Card className="bg-gradient-to-br from-rose-500 to-orange-500 text-white border-0">
        <CardContent className="py-8">
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium uppercase tracking-widest">
            <ReceiptIndianRupee className="h-5 w-5" /> Total Donations
          </div>
          <div className="text-5xl font-bold mt-3">{formatINR(data.totalAmount)}</div>
          <div className="text-white/80 text-sm mt-2">
            {data.successfulDonations} successful donations · {data.uniqueDonors} unique donors
          </div>
        </CardContent>
      </Card>

      {/* Everything else, category-wise */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Donations by Category{" "}
          <span className="text-sm text-muted-foreground font-normal">(this month)</span>
        </h2>
        {categories.length === 0 ? (
          <p className="text-muted-foreground">No categories yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((c: any) => (
              <Link key={c.id} href={`/admin/categories/${c.id}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">{c.title}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-emerald-600 font-semibold">
                        {formatINR(c.raised)} raised
                      </span>
                      <span className="text-muted-foreground">
                        {formatINR(c.remaining)} left
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-orange-500"
                        style={{ width: `${c.progress || 0}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5">
                      Target {formatINR(c.effectiveTarget)} · {c.progress || 0}%
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Donations</h2>
        <Card>
          <CardContent className="p-0">
            {!data.recentDonations || data.recentDonations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No donations yet.</div>
            ) : (
              <div className="divide-y divide-border">
                {data.recentDonations.map((d: any, i: number) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedDonation(d)}
                  >
                    <div>
                      <p className="font-medium">
                        {d.isAnonymous ? "Anonymous Donor" : d.donorName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {d.categoryId?.title || "Custom"}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-bold">{formatINR(d.amount)}</p>
                      <StatusBadge status={d.paymentStatus} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DonationDetailDialog
        donation={selectedDonation}
        onClose={() => setSelectedDonation(null)}
        onUpdate={loadData}
      />
    </div>
  );
}
