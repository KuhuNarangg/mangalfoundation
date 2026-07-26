"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime, formatDate } from "@/lib/format";
import { CheckSquare, Plus, Loader2 } from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
  });

  useEffect(() => {
    fetchTasks();
    fetchTeam();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/admin/tasks");
      const json = await res.json();
      if (json.success) setTasks(json.data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async () => {
    try {
      // Need an endpoint that returns all members/volunteers compactly
      const res = await fetch("/api/admin/users?role=member,volunteer&limit=1000"); 
      const json = await res.json();
      if (json.success) {
        setTeam(json.data);
      }
    } catch {
      console.error("Failed to load team");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.assignedTo) {
      toast.error("Please select a member or volunteer to assign the task");
      setIsSubmitting(false);
      return;
    }

    try {

      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          assignedTo: [formData.assignedTo] // wrap in array since schema supports multiple
        }),
      });

      if (res.ok) {
        toast.success("Task assigned successfully!");
        setIsDialogOpen(false);
        setFormData({ title: "", description: "", assignedTo: "", dueDate: "" });
        fetchTasks();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create task");
      }
    } catch {
      toast.error("Error creating task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground mt-1">Assign and track tasks for members and volunteers.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> Assign Task
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Task Title</Label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Prepare Event Venue" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Details of the task..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select value={formData.assignedTo} onValueChange={v => setFormData({...formData, assignedTo: v as string})} required>
                  <SelectTrigger><SelectValue placeholder="Select member/volunteer" /></SelectTrigger>
                  <SelectContent>
                    {team.map(u => (
                      <SelectItem key={u._id} value={u._id} label={`${u.name || u.email} (${u.roles[0]})`}>
                        {u.name || u.email} ({u.roles[0]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Assign Task"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : tasks.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No tasks assigned yet.</TableCell></TableRow>
            ) : (
              tasks.map((t) => (
                <TableRow key={t._id}>
                  <TableCell>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground max-w-[200px] truncate">{t.description}</p>
                  </TableCell>
                  <TableCell>
                    {t.assignedTo?.map((u: any) => u.name || u.email).join(", ")}
                  </TableCell>
                  <TableCell>{formatDate(t.dueDate)}</TableCell>
                  <TableCell>
                    <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${
                      t.status === "completed" ? "bg-green-100 text-green-800" :
                      t.status === "in-progress" ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {t.status.replace("-", " ")}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
