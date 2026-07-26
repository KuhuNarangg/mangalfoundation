import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Task from "@/models/Task";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  const { response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    await connectToDatabase();
    const tasks = await Task.find()
      .populate("assignedTo", "name email memberId profilePicture")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { session, response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const { title, description, assignedTo, dueDate } = await req.json();

    if (!title || !description || !assignedTo || !dueDate) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const task = await Task.create({
      title,
      description,
      assignedTo,
      dueDate: new Date(dueDate),
      createdBy: session.id,
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create task" }, { status: 500 });
  }
}
