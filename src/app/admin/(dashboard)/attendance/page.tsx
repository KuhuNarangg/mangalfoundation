"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTime } from "@/lib/format";
import { ChevronLeft, ChevronRight, User as UserIcon } from "lucide-react";

export default function AdminAttendancePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/attendance?date=${date.toISOString()}`);
      const json = await res.json();
      if (json.success) {
        setRecords(json.data);
      }
    } catch {
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    setDate(newDate);
  };

  const handleCheckout = async (recordId: string) => {
    setActionLoading(recordId);
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check-out", recordId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Successfully checked out member");
        fetchAttendance();
      } else {
        toast.error(data.error || "Failed to checkout");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Logs</h1>
          <p className="text-muted-foreground mt-1">Monitor daily check-ins for members and volunteers.</p>
        </div>

        <div className="flex items-center gap-2 bg-white rounded-md border p-1">
          <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="px-4 font-medium min-w-[140px] text-center">
            {date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <Button variant="ghost" size="icon" onClick={() => changeDate(1)} disabled={date.toDateString() === new Date().toDateString()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>ID / Role</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading records...</TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No attendance records found for this date.
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                            {r.userId?.profilePicture ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={r.userId.profilePicture} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <UserIcon className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{r.userId?.name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{r.userId?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{r.userId?.memberId || "-"}</p>
                        <p className="text-xs text-muted-foreground capitalize">{r.userId?.roles?.[0]}</p>
                      </TableCell>
                      <TableCell className="font-medium">
                        {r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                      </TableCell>
                      <TableCell>
                        {r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                      </TableCell>
                      <TableCell>
                        {r.totalHours ? `${r.totalHours} hrs` : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 items-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            r.checkOut ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                          }`}>
                            {r.checkOut ? "Completed" : "Clocked In"}
                          </span>
                          {!r.checkOut && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              disabled={actionLoading === r._id}
                              onClick={() => handleCheckout(r._id)}
                            >
                              Check Out
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
