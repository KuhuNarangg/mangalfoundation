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
import { CheckSquare, Plus, Loader2, MessageSquare, User } from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    progress: 0,
    noteText: "",
  });

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

  const openUpdateDialog = (task: any) => {
    setSelectedTask(task);
    setUpdateForm({
      status: task.status,
      progress: task.progress || 0,
      noteText: "",
    });
    setIsUpdateDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedTask) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/tasks/${selectedTask._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateForm),
      });
      if (res.ok) {
        toast.success("Task updated");
        setIsUpdateDialogOpen(false);
        fetchTasks();
      } else {
        toast.error("Failed to update task");
      }
    } catch {
      toast.error("Network error");
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select member/volunteer">
                      {formData.assignedTo && team.find(u => u._id === formData.assignedTo) 
                        ? `${team.find(u => u._id === formData.assignedTo).name || team.find(u => u._id === formData.assignedTo).email} (${team.find(u => u._id === formData.assignedTo).roles[0]})` 
                        : "Select member/volunteer"}
                    </SelectValue>
                  </SelectTrigger>
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
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                    <div className="flex items-center gap-2 max-w-[120px]">
                      <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${t.progress || 0}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{t.progress || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${
                      t.status === "completed" ? "bg-green-100 text-green-800" :
                      t.status === "in-progress" ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {t.status.replace("-", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => openUpdateDialog(t)}>
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border border-gray-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white font-bold text-xl">Manage Task</DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-6 mt-4 text-white">
              <div>
                <h3 className="font-bold text-lg text-white">{selectedTask.title}</h3>
                <p className="text-sm text-gray-300 font-medium mt-2">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-gray-800/80 p-4 rounded-lg border border-gray-700">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-white">Status Override</label>
                  <Select value={updateForm.status} onValueChange={(v: any) => setUpdateForm({...updateForm, status: v || ""})}>
                    <SelectTrigger className="bg-gray-900 text-white border-gray-700 font-semibold">
                      <SelectValue placeholder="Select Status" className="text-white" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 text-white border-gray-700">
                      <SelectItem value="pending" className="text-white focus:bg-gray-800">Pending</SelectItem>
                      <SelectItem value="in-progress" className="text-white focus:bg-gray-800">In Progress</SelectItem>
                      <SelectItem value="completed" className="text-white focus:bg-gray-800">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-sm font-bold text-white">Progress Override</label>
                    <span className="text-sm font-extrabold text-white">{updateForm.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={updateForm.progress}
                    onChange={(e) => setUpdateForm({...updateForm, progress: parseInt(e.target.value)})}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-white flex items-center"><MessageSquare className="w-4 h-4 mr-2 text-blue-400"/> Add Admin Note</label>
                <Textarea 
                  placeholder="Share feedback or instructions..." 
                  value={updateForm.noteText} 
                  onChange={(e) => setUpdateForm({...updateForm, noteText: e.target.value})}
                  rows={3}
                  className="bg-gray-800 border-gray-700 text-white font-medium placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-800">
                <Button onClick={handleUpdate} disabled={isSubmitting} className="font-bold bg-blue-600 hover:bg-blue-700 text-white px-6">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                  Save Admin Updates
                </Button>
              </div>

              {selectedTask.notes && selectedTask.notes.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h4 className="font-bold text-sm text-gray-300 uppercase tracking-wider">Activity History</h4>
                  <div className="space-y-3">
                    {selectedTask.notes.slice().reverse().map((n: any, idx: number) => (
                      <div key={idx} className={`p-3 rounded-lg text-sm flex gap-3 ${n.role === 'admin' ? 'bg-blue-950/60 border border-blue-800/80 text-white' : 'bg-gray-800 border border-gray-700 text-white'}`}>
                        <div className="mt-0.5">
                          {n.role === 'admin' ? (
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center"><User className="w-3 h-3"/></div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-700 text-white font-bold flex items-center justify-center"><User className="w-3 h-3"/></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-bold text-xs capitalize text-white">{n.role}</span>
                            <span className="text-[10px] text-gray-400 font-semibold">{formatDateTime(n.createdAt)}</span>
                          </div>
                          <p className="text-gray-200 font-medium whitespace-pre-wrap">{n.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
