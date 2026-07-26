"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Play, Square, CheckCircle } from "lucide-react";

export function AttendanceWidget({ todayAttendance }: { todayAttendance: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isCheckedIn = !!todayAttendance?.checkIn && !todayAttendance?.checkOut;
  const isCompleted = !!todayAttendance?.checkIn && !!todayAttendance?.checkOut;

  const handleAction = async (action: "check-in" | "check-out") => {
    setLoading(true);
    try {
      const res = await fetch("/api/member/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Successfully ${action === "check-in" ? "checked in" : "checked out"}!`);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to process attendance");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">Shift Completed</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {!isCheckedIn ? (
        <Button 
          onClick={() => handleAction("check-in")} 
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold"
        >
          <Play className="mr-2 h-4 w-4" /> Check In
        </Button>
      ) : (
        <Button 
          onClick={() => handleAction("check-out")} 
          disabled={loading}
          variant="destructive"
          className="font-semibold"
        >
          <Square className="mr-2 h-4 w-4" /> Check Out
        </Button>
      )}
      <Button variant="outline" onClick={() => router.push("/member/attendance")}>
        View Logs
      </Button>
    </div>
  );
}
