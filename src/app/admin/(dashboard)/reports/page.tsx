"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download, ReceiptIndianRupee, Clock } from "lucide-react";
import { toast } from "sonner";

export default function ReportsPage() {
  
  const handleExport = async (type: string) => {
    toast.info(`Generating ${type} report...`);
    try {
      window.location.href = `/api/admin/reports/export?type=${type}`;
    } catch {
      toast.error("Failed to export report");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Exports</h1>
        <p className="text-muted-foreground mt-1">Download raw data across various modules for analysis.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ReceiptIndianRupee className="h-5 w-5 text-green-600" />
              Donations Report
            </CardTitle>
            <CardDescription>All successful online and offline donations.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-6">Includes donor names, emails, amounts, PAN details, and transaction IDs.</p>
            <Button className="w-full" onClick={() => handleExport("donations")}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Attendance Report
            </CardTitle>
            <CardDescription>Daily check-ins for all members and volunteers.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-6">Includes timestamps, total hours calculated, and user details.</p>
            <Button className="w-full" onClick={() => handleExport("attendance")}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-purple-600" />
              Campaigns Report
            </CardTitle>
            <CardDescription>Statistics for email outreach.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-6">Currently in development. Full analytics dashboard coming soon.</p>
            <Button className="w-full" disabled>
              <Download className="mr-2 h-4 w-4" /> Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
