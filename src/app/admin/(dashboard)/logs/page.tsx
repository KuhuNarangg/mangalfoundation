"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/logs?page=${page}&limit=50`);
        const json = await res.json();
        if (json.success) {
          setLogs(json.data);
          setPagination(json.pagination);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">{pagination.total} recorded actions</p>
      </div>

      <div className="bg-card rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No activity yet.</TableCell>
              </TableRow>
            ) : (
              logs.map((l) => (
                <TableRow key={l._id}>
                  <TableCell className="whitespace-nowrap text-sm">{formatDateTime(l.createdAt)}</TableCell>
                  <TableCell className="text-sm font-medium">{l.actorUsername || "system"}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{l.action}</code>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        l.status === "failure"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      }`}
                    >
                      {(l.status || "success").toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{l.message}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{l.ip}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
