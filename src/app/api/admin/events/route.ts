import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Event from "@/models/Event";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  const { response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    await connectToDatabase();
    const events = await Event.find().sort({ date: 1 }).lean();
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { session, response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const { title, description, date, location, imageUrl } = await req.json();

    if (!title || !description || !date || !location) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    await connectToDatabase();
    
    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      location,
      imageUrl,
      createdBy: session.id,
    });

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
