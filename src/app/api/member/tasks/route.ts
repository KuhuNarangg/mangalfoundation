import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";
import { getPublicSession } from "@/lib/public-auth";

export async function GET(req: Request) {
  try {
    const session = await getPublicSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    
    // Find tasks assigned to this user
    const tasks = await Task.find({ assignedTo: session.id })
      .sort({ dueDate: 1 })
      .lean();

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getPublicSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId, status } = await req.json();

    await connectToDatabase();
    const task = await Task.findOne({ _id: taskId, assignedTo: session.id });
    
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    task.status = status;
    await task.save();

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
