"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatINR, formatDate } from "@/lib/format";
import { FileText, Send, ChevronLeft, ChevronRight } from "lucide-react";

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  cheque: "Cheque",
  bank_transfer: "Bank Transfer",
  upi: "UPI",
  other: "Other",
};

export default function ReceiptsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, pages: 1 });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: "success", page: String(page), limit: "50" });
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/donations?${params}`);
      const j = await res.json();
      if (j.success) {
        setItems(j.data);
        setPagination(j.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const resend = async (id: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/donations/${id}/receipt/resend`, { method: "POST" });
      const json = await res.json();
      if (res.ok && json.success) toast.success(json.message || "Receipt emailed");
      else toast.error(json.message || json.error || "Failed to send receipt");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Receipts</h1>
        <p className="text-sm text-muted-foreground">
          {pagination.total} issued receipts — view, print, or resend to donors.
        </p>
      </div>

      <Input
        placeholder="Search donor name, email, phone..."
        className="max-w-sm"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />

      <div className="bg-card rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Donor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No receipts found.</TableCell>
              </TableRow>
            ) : (
              items.map((d) => (
                <TableRow key={d._id}>
                  <TableCell className="font-mono text-xs">{d.receiptNumber || "—"}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{formatDate(d.createdAt)}</TableCell>
                  <TableCell className="font-medium">{d.isAnonymous ? "Anonymous" : d.donorName}</TableCell>
                  <TableCell className="text-sm">{d.categoryId?.title || "—"}</TableCell>
                  <TableCell className="font-bold whitespace-nowrap">{formatINR(d.amount)}</TableCell>
                  <TableCell className="text-sm">
                    {d.source === "manual" ? METHOD_LABELS[d.paymentMethod] || "Offline" : "Online"}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <a href={`/receipt/${d._id}`} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="icon" title="View / Print">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </a>
                    {d.email && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Resend to donor"
                        disabled={busy}
                        onClick={() => resend(d._id)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
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
