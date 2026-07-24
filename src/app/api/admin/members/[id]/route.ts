import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Member from "@/models/Member";
import { getAdminSession } from "@/lib/auth";
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAdminSession();
    if (!auth || (auth.role !== "super_admin" && auth.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const updates = await req.json();

    // Prevent changing critical fields directly if not needed, though admins can do most things
    delete updates.password; // Passwords should be handled separately

    await connectToDatabase();
    
    const member = await Member.findByIdAndUpdate(id, { $set: updates }, { new: true });
    
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAdminSession();
    if (!auth || (auth.role !== "super_admin" && auth.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    
    const result = await Member.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Member deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
