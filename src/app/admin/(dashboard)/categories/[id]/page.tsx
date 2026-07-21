"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatINR, formatDateTime } from "@/lib/format";
import { downloadCSV } from "@/lib/export";
import { ArrowLeft, ChevronLeft, ChevronRight, Download } from "lucide-react";

export default function CategoryDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [detail, setDetail] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 25, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/categories/${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setDetail(j.data);
      });
  }, [id]);

  const loadDonations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/donations?categoryId=${id}&page=${page}&limit=25`);
      const j = await res.json();
      if (j.success) {
        setDonations(j.data);
        setPagination(j.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [id, page]);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  const cat = detail?.category;
  const b = detail?.budget;

  const exportCSV = () => {
    if (!donations.length) return;
    downloadCSV(
      `${cat?.slug || "category"}-donations.csv`,
      donations.map((d) => ({
        Date: formatDateTime(d.createdAt),
        Donor: d.isAnonymous ? "Anonymous" : d.donorName,
        Email: d.isAnonymous ? "" : d.email,
        Phone: d.isAnonymous ? "" : d.phone,
        Package: d.packageId?.title || "",
        Amount: d.amount,
        Status: d.paymentStatus,
      }))
    );
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/categories"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to categories
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{cat?.title || "Category"}</h1>
        {cat?.slug && <p className="text-sm text-muted-foreground">{cat.slug}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Monthly Target" value={formatINR(b?.effectiveTarget)} />
        <StatCard title="Raised (This Month)" value={formatINR(b?.raised)} sub={`${detail?.monthCount || 0} donations`} />
        <StatCard title="Remaining" value={formatINR(b?.remaining)} highlight />
        <StatCard title="All-Time Raised" value={formatINR(detail?.allTimeRaised)} sub={`${detail?.allTimeCount || 0} donations`} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Progress this month</span>
            <span>{b?.progress || 0}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-700"
              style={{ width: `${b?.progress || 0}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Donation Logs <span className="text-sm text-muted-foreground font-normal">({pagination.total})</span>
        </h2>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-1" /> CSV
        </Button>
      </div>

      <div className="bg-card rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Donor</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : donations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No donations in this category yet.</TableCell>
              </TableRow>
            ) : (
              donations.map((d) => (
                <TableRow key={d._id}>
                  <TableCell className="whitespace-nowrap text-sm">{formatDateTime(d.createdAt)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{d.isAnonymous ? "Anonymous" : d.donorName}</div>
                    {!d.isAnonymous && <div className="text-xs text-muted-foreground">{d.email}</div>}
                  </TableCell>
                  <TableCell className="text-sm">{d.packageId?.title || "Custom"}</TableCell>
                  <TableCell className="font-bold whitespace-nowrap">{formatINR(d.amount)}</TableCell>
                  <TableCell><StatusBadge status={d.paymentStatus} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  highlight,
}: {
  title: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className={`text-2xl font-bold mt-1 ${highlight ? "text-rose-600" : ""}`}>{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}
