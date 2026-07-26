"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { CheckSquare, Clock, CheckCircle2, Circle } from "lucide-react";

export default function MemberTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const updateStatus = async (taskId: string, status: string) => {
    try {
      const res = await fetch("/api/member/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status }),
      });
      if (res.ok) {
        toast.success("Task updated");
        fetchTasks(); // Refresh
      } else {
        toast.error("Failed to update task");
      }
    } catch {
      toast.error("Error updating task");
    }
  };

  if (loading) return <div className="p-8">Loading tasks...</div>;

  const pendingTasks = tasks.filter(t => t.status !== "completed");
  const completedTasks = tasks.filter(t => t.status === "completed");

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Tasks</h1>
        <p className="text-muted-foreground mt-1">Manage your assigned duties and track your progress.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" /> Pending Tasks ({pendingTasks.length})
          </h2>
          {pendingTasks.length === 0 ? (
            <div className="bg-gray-50 border rounded-lg p-8 text-center text-muted-foreground">
              You have no pending tasks. Great job!
            </div>
          ) : (
            pendingTasks.map(task => (
              <Card key={task._id} className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                      task.status === "in-progress" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {task.status.replace("-", " ")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-sm font-medium text-red-600">
                      Due: {formatDate(task.dueDate)}
                    </div>
                    <div className="flex gap-2">
                      {task.status === "pending" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(task._id, "in-progress")}>
                          Start
                        </Button>
                      )}
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(task._id, "completed")}>
                        <CheckCircle2 className="mr-1 h-4 w-4" /> Complete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-green-500" /> Completed Tasks ({completedTasks.length})
          </h2>
          {completedTasks.length === 0 ? (
            <div className="bg-gray-50 border rounded-lg p-8 text-center text-muted-foreground">
              No completed tasks yet.
            </div>
          ) : (
            completedTasks.map(task => (
              <Card key={task._id} className="border-none shadow-sm bg-gray-50 opacity-75">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base line-through text-gray-500 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> {task.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-500 line-clamp-1">{task.description}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
