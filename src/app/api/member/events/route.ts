import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Event from "@/models/Event";
import { getPublicSession } from "@/lib/public-auth";

export async function GET(req: Request) {
  try {
    const session = await getPublicSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    
    // Fetch upcoming events
    const events = await Event.find({ date: { $gte: new Date() } })
      .sort({ date: 1 })
      .lean();

    return NextResponse.json({ success: true, data: events, userId: session.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getPublicSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { eventId, action } = await req.json(); // action = "rsvp" or "cancel"

    await connectToDatabase();
    const event = await Event.findById(eventId);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    if (action === "rsvp") {
      if (!event.rsvps.includes(session.id)) {
        event.rsvps.push(session.id);
      }
    } else if (action === "cancel") {
      event.rsvps = event.rsvps.filter((id: any) => id.toString() !== session.id);
    }

    await event.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update RSVP" }, { status: 500 });
  }
}
