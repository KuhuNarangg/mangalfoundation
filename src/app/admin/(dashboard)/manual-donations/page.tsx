"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer } from "lucide-react";
import { formatINR } from "@/lib/format";

const METHODS = [
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
  { value: "other", label: "Other" },
];

const BLANK = {
  donorName: "",
  email: "",
  phone: "",
  categoryId: "",
  amount: "",
  paymentMethod: "cash",
  date: "",
  isAnonymous: false,
  notes: "",
};

export default function ManualDonationsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setCategories(j.data);
      })
      .catch(() => {});
    // Default the date to today (set after mount to avoid hydration mismatch).
    setForm((f) => ({ ...f, date: new Date().toISOString().slice(0, 10) }));
  }, []);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.categoryId) return toast.error("Please select a donation category");
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    if (!form.isAnonymous && !form.donorName.trim())
      return toast.error("Enter the donor's name (or mark anonymous)");

    setSaving(true);
    try {
      const res = await fetch("/api/admin/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: form.isAnonymous ? "Anonymous" : form.donorName,
          email: form.email,
          phone: form.phone,
          isAnonymous: form.isAnonymous,
          categoryId: form.categoryId,
          amount,
          paymentMethod: form.paymentMethod,
          date: form.date,
          notes: form.notes,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Donation recorded & receipt generated");
        setLastReceipt(json.data);
        setForm({ ...BLANK, date: form.date, paymentMethod: form.paymentMethod });
      } else {
        toast.error(json.error || json.details?.[0]?.message || "Failed to record");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manual Donations</h1>
        <p className="text-sm text-muted-foreground">
          Record an offline donation (cash, cheque, bank transfer, UPI). It's counted in
          all totals & analytics, and a receipt is generated automatically.
        </p>
      </div>

      {lastReceipt && (
        <Card className="border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20">
          <CardContent className="pt-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                Receipt {lastReceipt.receiptNumber}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatINR(lastReceipt.amount)} ·{" "}
                {lastReceipt.isAnonymous ? "Anonymous Donor" : lastReceipt.donorName}
              </p>
            </div>
            <a href={`/receipt/${lastReceipt._id}`} target="_blank" rel="noreferrer">
              <Button>
                <Printer className="h-4 w-4 mr-2" /> Preview / Download / Print
              </Button>
            </a>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Record a Donation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anon"
                checked={form.isAnonymous}
                onCheckedChange={(c) => set("isAnonymous", c === true)}
              />
              <Label htmlFor="anon">Anonymous donation (Gupt Daan)</Label>
            </div>

            {!form.isAnonymous && (
              <div className="space-y-2">
                <Label>Donor Name</Label>
                <Input value={form.donorName} onChange={(e) => set("donorName", e.target.value)} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email (optional)</Label>
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone (optional)</Label>
                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category">
                      {(v: any) => {
                        if (!v) return "Select category";
                        const c = categories.find((cat) => cat._id === v);
                        return c ? c.title : v;
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(e) => set("amount", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select value={form.paymentMethod} onValueChange={(v) => set("paymentMethod", v || "cash")}>
                  <SelectTrigger>
                    <SelectValue>
                      {(v: any) => {
                        const m = METHODS.find((meth) => meth.value === v);
                        return m ? m.label : v;
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Donation Date</Label>
                <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Recording..." : "Record Donation & Generate Receipt"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
