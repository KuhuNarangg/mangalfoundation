"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/format";
import { Trash2, Mail } from "lucide-react";

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/contacts");
      const json = await res.json();
      if (json.success) {
        setMessages(json.data);
        setUnread(json.unread);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const open = async (m: any) => {
    setSelected(m);
    if (!m.isRead) {
      await fetch(`/api/admin/contacts/${m._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const res = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Message deleted");
      setSelected(null);
      load();
    } else {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">
          {messages.length} total · {unread} unread
        </p>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : messages.length === 0 ? (
        <div className="bg-card rounded-md border p-12 text-center text-muted-foreground">
          <Mail className="h-8 w-8 mx-auto mb-3 opacity-50" />
          No messages yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {messages.map((m) => (
            <button
              key={m._id}
              onClick={() => open(m)}
              className={`text-left bg-card rounded-md border p-4 hover:shadow-sm transition-shadow ${
                !m.isRead ? "border-l-4 border-l-rose-500" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{m.name}</span>
                    {!m.isRead && (
                      <span className="text-[10px] uppercase tracking-wide bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 px-1.5 py-0.5 rounded">
                        New
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{m.email}</div>
                  <p className="text-sm text-muted-foreground truncate mt-1">{m.message}</p>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDateTime(m.createdAt)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Message from {selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="text-sm">
                <a href={`mailto:${selected.email}`} className="text-rose-600 hover:underline">
                  {selected.email}
                </a>
                <span className="text-muted-foreground"> · {formatDateTime(selected.createdAt)}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap bg-muted/50 rounded-md p-4">{selected.message}</p>
              <div className="flex justify-end gap-2">
                <a href={`mailto:${selected.email}`}>
                  <Button variant="outline" size="sm">Reply</Button>
                </a>
                <Button variant="destructive" size="sm" onClick={() => remove(selected._id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
