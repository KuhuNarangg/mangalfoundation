"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatINR, formatDateTime } from "@/lib/format";
import { FileText, Send, RefreshCw, Trash2 } from "lucide-react";

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  cheque: "Cheque",
  bank_transfer: "Bank Transfer",
  upi: "UPI",
  other: "Other",
};

export function DonationDetailDialog({
  donation,
  onClose,
  onUpdate,
}: {
  donation: any;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [busy, setBusy] = useState(false);

  if (!donation) return null;

  const updateStatus = async (paymentStatus: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/donations/${donation._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      if (res.ok) {
        toast.success("Status updated");
        donation.paymentStatus = paymentStatus; // Optimistic update
        onUpdate();
      } else {
        toast.error((await res.json()).error || "Failed to update");
      }
    } finally {
      setBusy(false);
    }
  };

  const refund = async () => {
    if (!confirm("Refund this donation via Razorpay? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/donations/${donation._id}/refund`, { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        toast.success("Donation refunded");
        onUpdate();
        onClose();
      } else {
        toast.error(json.error || "Refund failed");
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this donation permanently?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/donations/${donation._id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Donation deleted");
        onUpdate();
        onClose();
      } else {
        toast.error("Delete failed");
      }
    } finally {
      setBusy(false);
    }
  };

  const resendReceipt = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/donations/${donation._id}/receipt/resend`, { method: "POST" });
      const json = await res.json();
      if (res.ok && json.success) toast.success(json.message || "Receipt emailed");
      else toast.error(json.message || json.error || "Failed to send receipt");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={!!donation} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Donation Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <Detail label="Donor" value={donation.isAnonymous ? "Anonymous" : donation.donorName} />
            <Detail label="Amount" value={formatINR(donation.amount)} />
            {!donation.isAnonymous && <Detail label="Email" value={donation.email || "—"} />}
            {!donation.isAnonymous && <Detail label="Phone" value={donation.phone || "—"} />}
            <Detail label="PAN" value={donation.pan || "—"} />
            <Detail label="GST" value={donation.gst || "—"} />
            <Detail label="Cause" value={donation.categoryId?.title || "Custom"} />
            <Detail label="Package" value={donation.packageId?.title || "—"} />

            <Detail label="Date" value={formatDateTime(donation.createdAt)} />
            <Detail label="Order ID" value={donation.razorpayOrderId || "—"} />
            <Detail label="Payment ID" value={donation.razorpayPaymentId || "—"} />
            <Detail label="Receipt No." value={donation.receiptNumber || "—"} />
            <Detail
              label="Method"
              value={
                donation.source === "manual"
                  ? METHOD_LABELS[donation.paymentMethod] || "Offline"
                  : "Online (Razorpay)"
              }
            />
          </div>
          {donation.message && <Detail label="Message" value={donation.message} />}
          {donation.notes && <Detail label="Notes" value={donation.notes} />}
          <div className="flex items-center gap-2 pt-3 border-t border-border">
            <span className="text-muted-foreground">Status:</span>
            <Select value={donation.paymentStatus} onValueChange={updateStatus}>
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue>
                  {(v: any) => {
                    const m: Record<string, string> = {
                      success: "Success",
                      pending: "Pending",
                      failed: "Failed",
                      refunded: "Refunded",
                    };
                    return m[v] || v;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            {donation.paymentStatus === "success" && (
              <>
                <a href={`/receipt/${donation._id}`} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-1" />
                    Receipt
                  </Button>
                </a>
                {donation.email && (
                  <Button variant="outline" size="sm" disabled={busy} onClick={resendReceipt}>
                    <Send className="h-4 w-4 mr-1" />
                    Resend
                  </Button>
                )}
                <Button variant="outline" size="sm" disabled={busy} onClick={refund}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refund
                </Button>
              </>
            )}
            <Button variant="destructive" size="sm" disabled={busy} onClick={remove}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
