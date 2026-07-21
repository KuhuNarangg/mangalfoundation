import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Volunteer from "@/models/Volunteer";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-meta";
import { volunteerApplicationSchema, formatZodError } from "@/lib/validations";

export async function POST(req: Request) {
  const ip = getClientIp(req);

  try {
    // Spam throttle: max 5 applications per hour per IP.
    const rl = await rateLimit(`volunteer:${ip}`, 5, 60 * 60);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = volunteerApplicationSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(parsed.error) },
        { status: 400 }
      );
    }
    const d = parsed.data;

    await connectToDatabase();

    // Duplicate prevention: same email already applied and still in the pipeline.
    const dupe = await Volunteer.findOne({
      email: d.email,
      status: { $in: ["Pending", "In Review", "Contacted"] },
    }).lean();
    if (dupe) {
      return NextResponse.json(
        { error: "You've already applied — our team will reach out to you soon." },
        { status: 409 }
      );
    }

    await Volunteer.create({
      fullName: d.fullName,
      email: d.email,
      phone: d.phone,
      city: d.city || "",
      age: d.age ?? null,
      occupation: d.occupation || "",
      organization: d.organization || "",
      interestedAreas: d.interestedAreas || [],
      availability: d.availability || "",
      motivation: d.motivation || "",
      previousExperience: d.previousExperience || "",
      status: "Pending",
    });

    return NextResponse.json(
      { success: true, message: "Application received" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
