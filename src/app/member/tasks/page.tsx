"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare, Calendar, Loader2, MessageSquare, ListTodo, User } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatDateTime } from "@/lib/format";

export default function MemberTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Form state for selected task
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/member/tasks");
      const json = await res.json();
      if (json.success) setTasks(json.data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const openTask = (task: any) => {
    setSelectedTask(task);
    setStatus(task.status);
    setProgress(task.progress || 0);
    setNote("");
    setIsDialogOpen(true);
  };

  const handleUpdateTask = async () => {
    setUpdating(true);
    try {
      const res = await fetch("/api/member/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: selectedTask._id,
          status,
          progress,
          noteText: note
        }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Task updated successfully");
        setIsDialogOpen(false);
        fetchTasks();
      } else {
        toast.error(json.error || "Failed to update task");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-black font-semibold"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2"/> Loading tasks...</div>;

  const completed = tasks.filter(t => t.status === "completed").length;
  const inProgress = tasks.filter(t => t.status === "in-progress").length;
  const pending = tasks.filter(t => t.status === "pending").length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black">My Tasks</h1>
        <p className="text-black font-medium mt-1">Manage your assigned tasks, update progress, and add notes.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-black">Pending</p>
              <h2 className="text-2xl font-bold text-black">{pending}</h2>
            </div>
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full"><ListTodo className="h-5 w-5" /></div>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-black">In Progress</p>
              <h2 className="text-2xl font-bold text-black">{inProgress}</h2>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><CheckSquare className="h-5 w-5" /></div>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-black">Completed</p>
              <h2 className="text-2xl font-bold text-black">{completed}</h2>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-full"><CheckSquare className="h-5 w-5" /></div>
          </CardContent>
        </Card>
      </div>

      {tasks.length === 0 ? (
        <Card className="bg-white border-dashed">
          <CardContent className="py-12 text-center text-black font-medium">
            <CheckSquare className="h-12 w-12 mx-auto mb-4 text-black" />
            <p>You have no assigned tasks right now.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((task) => (
            <Card key={task._id} className="bg-white border hover:shadow-md transition-all cursor-pointer" onClick={() => openTask(task)}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-lg leading-tight text-black font-bold">{task.title}</CardTitle>
                  <span className={`capitalize px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                    task.status === "completed" ? "bg-green-100 text-green-800" :
                    task.status === "in-progress" ? "bg-blue-100 text-blue-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {task.status.replace("-", " ")}
                  </span>
                </div>
                <CardDescription className="flex items-center text-xs mt-1 text-black font-semibold">
                  <Calendar className="w-3 h-3 mr-1" /> Due: {formatDate(task.dueDate)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-black font-medium line-clamp-2 mb-4">{task.description}</p>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-black font-semibold">
                    <span>Progress</span>
                    <span>{task.progress || 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${task.progress || 0}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Update Task Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border border-gray-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white font-bold text-xl">Update Task</DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-6 mt-4 text-white">
              <div>
                <h3 className="font-bold text-lg text-white">{selectedTask.title}</h3>
                <p className="text-sm text-gray-300 font-medium mt-2">{selectedTask.description}</p>
                <p className="text-xs text-gray-400 font-semibold mt-2 flex items-center"><Calendar className="w-3 h-3 mr-1"/> Due: {formatDate(selectedTask.dueDate)}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-gray-800/80 p-4 rounded-lg border border-gray-700">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-white">Status</label>
                  <Select value={status} onValueChange={(v: any) => setStatus(v || "")}>
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
                    <label className="text-sm font-bold text-white">Progress</label>
                    <span className="text-sm font-extrabold text-white">{progress}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value))}
                    className="w-full accent-blue-500 mt-2"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-white flex items-center"><MessageSquare className="w-4 h-4 mr-2 text-blue-400"/> Add Note</label>
                <Textarea 
                  placeholder="Share updates on your progress..." 
                  value={note} 
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="bg-gray-800 border-gray-700 text-white font-medium placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-800">
                <Button onClick={handleUpdateTask} disabled={updating} className="font-bold bg-blue-600 hover:bg-blue-700 text-white px-6">
                  {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                  Save Updates
                </Button>
              </div>

              {/* Notes History */}
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
