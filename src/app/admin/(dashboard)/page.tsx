"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptIndianRupee, Users, LayoutGrid, Package, Clock, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  totalDonations: number;
  pendingDonations: number;
  successfulDonations: number;
  totalAmount: number;
  totalCategories: number;
  totalPackages: number;
  recentDonations: any[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/admin/dashboard");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Amount Collected", value: `₹${data.totalAmount.toLocaleString()}`, icon: ReceiptIndianRupee, color: "text-green-600" },
    { title: "Successful Donations", value: data.successfulDonations, icon: CheckCircle, color: "text-green-600" },
    { title: "Pending Donations", value: data.pendingDonations, icon: Clock, color: "text-amber-600" },
    { title: "Total Donations", value: data.totalDonations, icon: Users, color: "text-blue-600" },
    { title: "Active Categories", value: data.totalCategories, icon: LayoutGrid, color: "text-indigo-600" },
    { title: "Active Packages", value: data.totalPackages, icon: Package, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-bold tracking-tight mt-10 mb-4">Recent Donations</h2>
      <Card>
        <CardContent className="p-0">
          {data.recentDonations.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No donations yet.</div>
          ) : (
            <div className="divide-y">
              {data.recentDonations.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium">{d.isAnonymous ? "Anonymous Donor" : d.donorName}</p>
                    <p className="text-sm text-muted-foreground">{d.categoryId?.title || "Custom Donation"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{d.amount.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      d.paymentStatus === "success" ? "bg-green-100 text-green-800" :
                      d.paymentStatus === "pending" ? "bg-amber-100 text-amber-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {d.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
