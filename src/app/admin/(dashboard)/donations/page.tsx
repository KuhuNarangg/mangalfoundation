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
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DonationDetailDialog } from "@/components/admin/DonationDetailDialog";
import { formatINR, formatDateTime } from "@/lib/format";
import { downloadCSV, printHTML } from "@/lib/export";
import {
  Download,
  Printer,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  cheque: "Cheque",
  bank_transfer: "Bank Transfer",
  upi: "UPI",
  other: "Other",
};

export default function DonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");
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
  }, [statusFilter, search, categoryFilter, dateFilter, amountFilter]);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("categoryId", categoryFilter);
      if (search.trim()) params.set("search", search.trim());
      
      if (dateFilter !== "all") {
        const now = new Date();
        if (dateFilter === "this_month") {
          params.set("from", new Date(now.getFullYear(), now.getMonth(), 1).toISOString());
        } else if (dateFilter === "last_month") {
          params.set("from", new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString());
          params.set("to", new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).toISOString());
        } else if (dateFilter === "this_year") {
          params.set("from", new Date(now.getFullYear(), 0, 1).toISOString());
        }
      }

      if (amountFilter !== "all") {
        if (amountFilter === "under_1k") params.set("maxAmount", "999");
        if (amountFilter === "1k_5k") { params.set("minAmount", "1000"); params.set("maxAmount", "5000"); }
        if (amountFilter === "5k_10k") { params.set("minAmount", "5001"); params.set("maxAmount", "10000"); }
        if (amountFilter === "over_10k") params.set("minAmount", "10001");
      }

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
  }, [page, statusFilter, search, categoryFilter, dateFilter, amountFilter]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);


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

      <div className="flex flex-col md:flex-row gap-3 flex-wrap">
        <Input
          placeholder="Search name, email, phone..."
          className="w-full md:w-[220px]"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Status">
              {(v: any) => {
                if (!v || v === "all") return "All Statuses";
                const m: Record<string, string> = { success: "Success", pending: "Pending", failed: "Failed", refunded: "Refunded" };
                return m[v] || v;
              }}
            </SelectValue>
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
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue placeholder="Category">
              {(v: any) => {
                if (!v || v === "all") return "All Categories";
                const c = categories.find((cat) => cat._id === v);
                return c ? c.title : v;
              }}
            </SelectValue>
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
        <Select value={dateFilter} onValueChange={(v) => setDateFilter(v || "all")}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Date">
              {(v: any) => {
                if (!v || v === "all") return "All Time";
                const m: Record<string, string> = { this_month: "This Month", last_month: "Last Month", this_year: "This Year" };
                return m[v] || v;
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="this_year">This Year</SelectItem>
          </SelectContent>
        </Select>
        <Select value={amountFilter} onValueChange={(v) => setAmountFilter(v || "all")}>
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue placeholder="Amount">
              {(v: any) => {
                if (!v || v === "all") return "All Amounts";
                const m: Record<string, string> = { under_1k: "Under ₹1,000", "1k_5k": "₹1,000 - ₹5,000", "5k_10k": "₹5,000 - ₹10,000", over_10k: "Above ₹10,000" };
                return m[v] || v;
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Amounts</SelectItem>
            <SelectItem value="under_1k">Under ₹1,000</SelectItem>
            <SelectItem value="1k_5k">₹1,000 - ₹5,000</SelectItem>
            <SelectItem value="5k_10k">₹5,000 - ₹10,000</SelectItem>
            <SelectItem value="over_10k">Above ₹10,000</SelectItem>
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
                    <div className="font-medium flex items-center gap-1.5">
                      {d.isAnonymous ? "Anonymous" : d.donorName}
                      {d.source === "manual" && (
                        <span className="text-[10px] uppercase bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 px-1.5 py-0.5 rounded">
                          Manual
                        </span>
                      )}
                    </div>
                    {!d.isAnonymous && d.email && (
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

      <DonationDetailDialog 
        donation={selected} 
        onClose={() => setSelected(null)} 
        onUpdate={fetchDonations} 
      />
    </div>
  );
}
