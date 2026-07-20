"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function DonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const fetchDonations = async (status: string) => {
    setLoading(true);
    try {
      const url = status === "all" ? "/api/admin/donations" : `/api/admin/donations?status=${status}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setDonations(json.data);
    } catch (e) {
      toast.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations(statusFilter);
  }, [statusFilter]);

  const filteredDonations = donations.filter(d => 
    d.donorName.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Donations</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Input 
          placeholder="Search by name or email..." 
          className="max-w-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Donor</TableHead>
              <TableHead>Category/Package</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : filteredDonations.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No donations found.</TableCell></TableRow>
            ) : (
              filteredDonations.map(d => (
                <TableRow key={d._id}>
                  <TableCell className="whitespace-nowrap">{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="font-medium">{d.isAnonymous ? "Anonymous Donor" : d.donorName}</div>
                    {!d.isAnonymous && <div className="text-xs text-muted-foreground">{d.email} <br/> {d.phone}</div>}
                  </TableCell>
                  <TableCell>
                    <div>{d.categoryId?.title || "Custom"}</div>
                    {d.packageId && <div className="text-xs text-muted-foreground">{d.packageId.title}</div>}
                  </TableCell>
                  <TableCell className="font-bold">₹{d.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      d.paymentStatus === "success" ? "bg-green-100 text-green-800" :
                      d.paymentStatus === "pending" ? "bg-amber-100 text-amber-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {d.paymentStatus.toUpperCase()}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
