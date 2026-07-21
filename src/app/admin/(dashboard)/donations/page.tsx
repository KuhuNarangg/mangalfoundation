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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatINR, formatDateTime } from "@/lib/format";
import { downloadCSV, printHTML } from "@/lib/export";
import {
  Download,
  Printer,
  Eye,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function DonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Load categories for the filter dropdown.
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setCategories(j.data);
      })
      .catch(() => {});
  }, []);

  // Reset to page 1 whenever filters change.
  useEffect(() => {
    setPage(1);
  }, [statusFilter, search, categoryFilter]);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("categoryId", categoryFilter);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/donations?${params}`);
      const json = await res.json();
      if (json.success) {
        setDonations(json.data);
        setPagination(json.pagination);
      }
    } catch {
      toast.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search, categoryFilter]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const updateStatus = async (id: string, paymentStatus: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/donations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      if (res.ok) {
        toast.success("Status updated");
        setSelected((s: any) => (s ? { ...s, paymentStatus } : s));
        fetchDonations();
      } else {
        toast.error((await res.json()).error || "Failed to update");
      }
    } finally {
      setBusy(false);
    }
  };

  const refund = async (id: string) => {
    if (!confirm("Refund this donation via Razorpay? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/donations/${id}/refund`, { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        toast.success("Donation refunded");
        setSelected(null);
        fetchDonations();
      } else {
        toast.error(json.error || "Refund failed");
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this donation permanently?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/donations/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Donation deleted");
        setSelected(null);
        fetchDonations();
      } else {
        toast.error("Delete failed");
      }
    } finally {
      setBusy(false);
    }
  };

  const exportCSV = () => {
    if (!donations.length) return toast.error("Nothing to export");
    downloadCSV(
      `donations-page-${page}.csv`,
      donations.map((d) => ({
        Date: formatDateTime(d.createdAt),
        Donor: d.isAnonymous ? "Anonymous" : d.donorName,
        Email: d.isAnonymous ? "" : d.email,
        Phone: d.isAnonymous ? "" : d.phone,
        Cause: d.categoryId?.title || "Custom",
        Package: d.packageId?.title || "",
        Amount: d.amount,
        Status: d.paymentStatus,
        PaymentId: d.razorpayPaymentId || "",
      }))
    );
  };

  const exportPDF = () => {
    if (!donations.length) return toast.error("Nothing to export");
    const rows = donations
      .map(
        (d) =>
          `<tr><td>${formatDateTime(d.createdAt)}</td><td>${
            d.isAnonymous ? "Anonymous" : d.donorName
          }</td><td>${d.categoryId?.title || "Custom"}</td><td>${formatINR(
            d.amount
          )}</td><td>${d.paymentStatus}</td></tr>`
      )
      .join("");
    printHTML(
      "Donations",
      `<h1>Donations Report</h1><table><thead><tr><th>Date</th><th>Donor</th><th>Cause</th><th>Amount</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donations</h1>
          <p className="text-sm text-muted-foreground">{pagination.total} total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF}>
            <Printer className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <Input
          placeholder="Search name, email, phone..."
          className="max-w-sm"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v || "all")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Donor</TableHead>
              <TableHead>Cause</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : donations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No donations found.
                </TableCell>
              </TableRow>
            ) : (
              donations.map((d) => (
                <TableRow key={d._id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {formatDateTime(d.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {d.isAnonymous ? "Anonymous" : d.donorName}
                    </div>
                    {!d.isAnonymous && (
                      <div className="text-xs text-muted-foreground">{d.email}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {d.categoryId?.title || "Custom"}
                    {d.packageId && (
                      <div className="text-xs text-muted-foreground">
                        {d.packageId.title}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-bold whitespace-nowrap">
                    {formatINR(d.amount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={d.paymentStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setSelected(d)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.pages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Donation Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Detail label="Donor" value={selected.isAnonymous ? "Anonymous" : selected.donorName} />
                <Detail label="Amount" value={formatINR(selected.amount)} />
                {!selected.isAnonymous && <Detail label="Email" value={selected.email} />}
                {!selected.isAnonymous && <Detail label="Phone" value={selected.phone} />}
                <Detail label="Cause" value={selected.categoryId?.title || "Custom"} />
                <Detail label="Package" value={selected.packageId?.title || "—"} />
                <Detail label="PAN" value={selected.pan || "—"} />
                <Detail label="Date" value={formatDateTime(selected.createdAt)} />
                <Detail label="Order ID" value={selected.razorpayOrderId || "—"} />
                <Detail label="Payment ID" value={selected.razorpayPaymentId || "—"} />
              </div>
              {selected.message && <Detail label="Message" value={selected.message} />}
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <span className="text-muted-foreground">Status:</span>
                <Select
                  value={selected.paymentStatus}
                  onValueChange={(v) => updateStatus(selected._id, v)}
                >
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                {selected.paymentStatus === "success" && (
                  <Button variant="outline" size="sm" disabled={busy} onClick={() => refund(selected._id)}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refund
                  </Button>
                )}
                <Button variant="destructive" size="sm" disabled={busy} onClick={() => remove(selected._id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium break-words">{value}</div>
    </div>
  );
}
