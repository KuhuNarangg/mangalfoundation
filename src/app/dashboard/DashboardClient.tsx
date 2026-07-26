"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, ReceiptText, Heart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DashboardClientProps {
  initialDonations: any[];
  totalDonated: number;
  user?: {
    name: string;
    roles: string[];
    memberId: string;
    designation: string;
    bloodGroup: string;
    joiningDate: string;
  } | null;
}

export function DashboardClient({ initialDonations, totalDonated, user }: DashboardClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/public/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
      toast.success("Logged out successfully");
    } catch {
      toast.error("Failed to logout");
    } finally {
      setLoading(false);
    }
  };

  const isMember = user?.roles.includes("member");
  const isVolunteer = user?.roles.includes("volunteer");

  return (
    <div className="space-y-8">
      {/* Roles & Badges Section */}
      {(isMember || isVolunteer) && (
        <div className="bg-white border border-sand rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-heading text-xl">
              {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-bold text-xl text-charcoal">{user?.name || "Official Member"}</h2>
                {isMember && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">
                    Member
                  </span>
                )}
                {isVolunteer && (
                  <span className="bg-sky-100 text-sky-800 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">
                    Volunteer
                  </span>
                )}
              </div>
              {isMember && user?.memberId && (
                <p className="text-sm text-charcoal-light">
                  Member ID: <span className="font-mono font-bold text-charcoal">{user.memberId}</span>
                </p>
              )}
            </div>
          </div>
          {isMember && (
            <div className="bg-beige-light rounded-xl p-4 text-sm w-full sm:w-auto">
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <div>
                  <span className="text-charcoal-light text-xs uppercase tracking-wider block">Designation</span>
                  <span className="font-medium text-charcoal">{user?.designation || "Member"}</span>
                </div>
                <div>
                  <span className="text-charcoal-light text-xs uppercase tracking-wider block">Blood Group</span>
                  <span className="font-medium text-charcoal text-red-500">{user?.bloodGroup || "—"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-sand rounded-2xl p-8 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-charcoal-light text-sm uppercase tracking-widest font-bold mb-2">Total Impact</p>
            <h2 className="text-4xl font-heading text-charcoal">₹{totalDonated.toLocaleString("en-IN")}</h2>
          </div>
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
            <Heart className="w-8 h-8 fill-current" />
          </div>
        </div>

        <div className="bg-white border border-sand rounded-2xl p-8 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-charcoal-light text-sm uppercase tracking-widest font-bold mb-2">Donations Made</p>
            <h2 className="text-4xl font-heading text-charcoal">{initialDonations.length}</h2>
          </div>
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">
            <ReceiptText className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Donation History Table */}
      <div className="bg-white border border-sand rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-sand flex justify-between items-center">
          <h3 className="font-heading text-2xl text-charcoal">Your Donation History</h3>
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            disabled={loading}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-beige-light/50">
              <TableRow>
                <TableHead className="font-bold text-charcoal-light uppercase tracking-wider text-xs">Date</TableHead>
                <TableHead className="font-bold text-charcoal-light uppercase tracking-wider text-xs">Category</TableHead>
                <TableHead className="font-bold text-charcoal-light uppercase tracking-wider text-xs">Receipt No.</TableHead>
                <TableHead className="font-bold text-charcoal-light uppercase tracking-wider text-xs">Status</TableHead>
                <TableHead className="font-bold text-charcoal-light uppercase tracking-wider text-xs text-right">Amount</TableHead>
                <TableHead className="font-bold text-charcoal-light uppercase tracking-wider text-xs text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialDonations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-charcoal-light">
                    <Heart className="w-12 h-12 text-sand mx-auto mb-4" />
                    <p>You haven't made any donations yet.</p>
                  </TableCell>
                </TableRow>
              ) : (
                initialDonations.map((d) => (
                  <TableRow key={d._id} className="hover:bg-beige-light/30">
                    <TableCell className="text-sm">
                      {new Date(d.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="font-medium text-charcoal">{d.categoryTitle}</TableCell>
                    <TableCell className="text-sm font-mono">{d.receiptNumber || "—"}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                        d.paymentStatus === "success" ? "bg-emerald-100 text-emerald-700" :
                        d.paymentStatus === "pending" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {d.paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-charcoal">
                      ₹{d.amount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-center">
                      {d.paymentStatus === "success" && d.receiptNumber ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => window.open(`/receipt/${d._id}`, '_blank')}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
