"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Clock, Play, Square, Calendar as CalendarIcon, History } from "lucide-react";

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Clock tick
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await fetch("/api/member/attendance");
      const json = await res.json();
      if (res.ok) {
        setHistory(json.data);
        
        // Find today's record
        const todayStr = new Date().toDateString();
        const today = json.data.find((r: any) => new Date(r.date).toDateString() === todayStr);
        setTodayRecord(today || null);
      }
    } catch {
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "check-in" | "check-out") => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/member/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Successfully ${action === "check-in" ? "checked in" : "checked out"}!`);
        fetchAttendance();
      } else {
        toast.error(data.error || "Failed to process attendance");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "--:--";
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateDuration = () => {
    if (!todayRecord?.checkIn) return "0h 0m";
    const start = new Date(todayRecord.checkIn).getTime();
    const end = todayRecord.checkOut ? new Date(todayRecord.checkOut).getTime() : currentTime.getTime();
    const diffMs = end - start;
    const hrs = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hrs}h ${mins}m`;
  };

  if (loading) return <div className="p-8">Loading attendance...</div>;

  const isCheckedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut;
  const isCompleted = !!todayRecord?.checkIn && !!todayRecord?.checkOut;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black">Attendance</h1>
        <p className="text-black font-medium mt-1">Track your daily hours and check-in status.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm bg-white overflow-hidden relative">
          <div className={`absolute inset-x-0 top-0 h-1 ${isCheckedIn ? 'bg-green-500' : isCompleted ? 'bg-blue-500' : 'bg-gray-200'}`} />
          <CardHeader>
            <CardTitle className="text-black font-bold">Daily Status</CardTitle>
            <CardDescription className="text-black font-medium">{currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold tracking-tighter text-black mb-2">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-sm font-bold text-black uppercase tracking-widest">
                {isCompleted ? "Shift Completed" : isCheckedIn ? "Currently Clocked In" : "Not Clocked In"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <p className="text-sm text-black font-semibold mb-1">Check In</p>
                <p className="font-bold text-lg text-black">{formatTime(todayRecord?.checkIn)}</p>
              </div>
              <div>
                <p className="text-sm text-black font-semibold mb-1">Check Out</p>
                <p className="font-bold text-lg text-black">{formatTime(todayRecord?.checkOut)}</p>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              {!isCheckedIn && !isCompleted && (
                <Button 
                  size="lg" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full py-6 text-lg shadow-sm"
                  onClick={() => handleAction("check-in")}
                  disabled={actionLoading}
                >
                  <Play className="mr-2 h-5 w-5 fill-current" /> Clock In
                </Button>
              )}
              {isCheckedIn && (
                <Button 
                  size="lg" 
                  variant="destructive"
                  className="w-full rounded-full py-6 text-lg shadow-sm"
                  onClick={() => handleAction("check-out")}
                  disabled={actionLoading}
                >
                  <Square className="mr-2 h-5 w-5 fill-current" /> Clock Out
                </Button>
              )}
              {isCompleted && (
                <div className="w-full bg-gray-50 border rounded-xl py-4 px-6 text-center text-black font-medium flex flex-col items-center justify-center">
                  <span className="text-sm font-semibold">Total hours today</span>
                  <span className="text-2xl text-black font-extrabold">{calculateDuration()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black font-bold">
              <History className="h-5 w-5 text-black" /> Recent History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-black font-medium text-center py-8">No attendance records found for this month.</p>
            ) : (
              <div className="space-y-4">
                {history.slice(0, 5).map((record) => (
                  <div key={record._id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-black">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-black">{new Date(record.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                        <p className="text-xs text-black font-semibold capitalize">{record.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-black">{record.totalHours ? `${record.totalHours} hrs` : '--'}</p>
                      <p className="text-xs text-black font-semibold">
                        {formatTime(record.checkIn)} - {formatTime(record.checkOut)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
