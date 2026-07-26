import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Volunteer from "@/models/Volunteer";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";
import { volunteerUpdateSchema, formatZodError } from "@/lib/validations";
import { sendVolunteerAcceptanceEmail, sendVolunteerRejectionEmail } from "@/lib/email";
import EmailLog from "@/models/EmailLog";
import User from "@/models/User";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Helper to generate a random password
const generatePassword = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAdmin(["super_admin", "admin", "editor"]);
  if (response) return response;

  try {
    const { id } = await params;
    const json = await req.json().catch(() => null);
    const parsed = volunteerUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Get the original volunteer to see if status changed
    const originalVolunteer = await Volunteer.findById(id);
    if (!originalVolunteer) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const volunteer = await Volunteer.findByIdAndUpdate(id, parsed.data, {
      returnDocument: "after",
    });

    // Send automated emails and sync User roles if status changed
    if (parsed.data.status && parsed.data.status !== originalVolunteer.status) {
      if (parsed.data.status === "Accepted") {
        
        // Find or create User record to grant Member + Volunteer roles
        const normalizedEmail = volunteer.email.toLowerCase().trim();
        let user = await User.findOne({ email: normalizedEmail });
        let memberId = undefined;
        let rawPassword = "";
        let hashedPassword = "";

        if (user) {
          memberId = user.memberId;
          if (!memberId && !user.roles.includes("member")) {
            const count = await User.countDocuments({ roles: "member" });
            memberId = `MGF-${1000 + count + 1}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
          }
          
          if (!user.password) {
            rawPassword = generatePassword();
            hashedPassword = await bcrypt.hash(rawPassword, 10);
          }

          const updateData: any = { 
            $addToSet: { roles: { $each: ["member", "volunteer"] } },
            $set: { memberId: memberId || user.memberId }
          };
          if (hashedPassword) updateData.$set.password = hashedPassword;

          await User.updateOne(
            { email: normalizedEmail },
            updateData
          );
        } else {
          const count = await User.countDocuments({ roles: "member" });
          memberId = `MGF-${1000 + count + 1}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
          rawPassword = generatePassword();
          hashedPassword = await bcrypt.hash(rawPassword, 10);

          await User.create({
            email: normalizedEmail,
            name: volunteer.fullName,
            phone: volunteer.phone,
            roles: ["user", "member", "volunteer"],
            memberId,
            password: hashedPassword
          });
        }

        // Attach password to the volunteer object just for the email template
        if (rawPassword) {
          volunteer.password = rawPassword;
        }
      }

      // Send status email asynchronously
      if (parsed.data.status === "Accepted") {
        (async () => {
          try {
            const sent = await sendVolunteerAcceptanceEmail(volunteer);
            await EmailLog.create({
              recipient: volunteer.email,
              type: "Acceptance",
              subject: "Welcome! Your Volunteer Application is Approved - Mangal Guruji Foundation",
              status: sent ? "Sent" : "Failed",
              error: sent ? "" : "SMTP failure",
            });
          } catch (err) {
            console.error("Background email error:", err);
          }
        })();
      } else if (parsed.data.status === "Rejected") {
        (async () => {
          try {
            const sent = await sendVolunteerRejectionEmail(volunteer, parsed.data.adminNotes || "");
            await EmailLog.create({
              recipient: volunteer.email,
              type: "Rejection",
              subject: "Update on your Volunteer Application - Mangal Guruji Foundation",
              status: sent ? "Sent" : "Failed",
              error: sent ? "" : "SMTP failure",
            });
          } catch (err) {
            console.error("Background email error:", err);
          }
        })();
      }
    }

    await logAudit({
      action: "volunteer.update",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Volunteer",
      targetId: id,
      metadata: { fields: Object.keys(parsed.data) },
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, data: volunteer });
  } catch {
    return NextResponse.json({ error: "Failed to update volunteer" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const { id } = await params;
    await connectToDatabase();
    const volunteer = await Volunteer.findByIdAndDelete(id);
    if (!volunteer) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await logAudit({
      action: "volunteer.delete",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Volunteer",
      targetId: id,
      message: `Deleted application from ${volunteer.fullName}`,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete volunteer" }, { status: 500 });
  }
}
