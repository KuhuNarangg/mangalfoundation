import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { session, response } = await requireAdmin(["super_admin", "admin", "editor"]);
    if (response) return response;

    const { status, progress, noteText } = await req.json();

    await connectToDatabase();
    const id = (await params).id;
    const task = await Task.findById(id);
    
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    if (status) task.status = status;
    if (progress !== undefined) task.progress = progress;
    
    if (noteText && noteText.trim() !== "") {
      task.notes.push({
        text: noteText.trim(),
        addedBy: session.id, // Or session user id
        role: session.role || "admin",
        createdAt: new Date(),
      });
    }

    await task.save();

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { response } = await requireAdmin(["super_admin", "admin"]);
    if (response) return response;

    await connectToDatabase();
    const id = (await params).id;
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
