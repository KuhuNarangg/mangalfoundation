import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import EmailLog from "@/models/EmailLog";
import { requireAdmin } from "@/lib/auth";
import { sendMemberWelcomeEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Helper to generate a random password
const generatePassword = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

export async function GET(req: Request) {
  const { response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(1000, Math.max(1, parseInt(searchParams.get("limit") || "25", 10) || 25));
    const skip = (page - 1) * limit;
    
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const query: any = {};
    if (role && role !== "all") {
      query.roles = { $in: role.split(",") };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { memberId: { $regex: search, $options: "i" } },
      ];
    }

    await connectToDatabase();

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { session, response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const body = await req.json();
    const { email, name, phone, roles, designation, bloodGroup } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    await connectToDatabase();

    let user = await User.findOne({ email: normalizedEmail });
    const isNew = !user;
    
    let rawPassword = "";
    let hashedPassword = "";

    // Generate a unique member ID and password if they are becoming a member
    let memberId = undefined;
    if (roles && roles.includes("member")) {
      const count = await User.countDocuments({ roles: "member" });
      memberId = `MGF-${1000 + count + 1}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
      
      // Only generate new password if it's a new user or an existing user without a password
      if (isNew || !user.password) {
        rawPassword = generatePassword();
        hashedPassword = await bcrypt.hash(rawPassword, 10);
      }
    }

    if (user) {
      // Update existing user
      const updatedRoles = [...new Set([...user.roles, ...(roles || [])])];
      const updateData: any = { 
        name: name || user.name,
        phone: phone || user.phone,
        roles: updatedRoles,
        designation: designation || user.designation,
        bloodGroup: bloodGroup || user.bloodGroup,
        memberId: user.memberId || memberId
      };
      
      if (hashedPassword) {
        updateData.password = hashedPassword;
      }

      user = await User.findOneAndUpdate(
        { email: normalizedEmail },
        { $set: updateData },
        { new: true }
      );
    } else {
      // Create new user
      const createData: any = {
        email: normalizedEmail,
        name,
        phone,
        roles: roles || ["user"],
        designation,
        bloodGroup,
        memberId,
      };
      
      if (hashedPassword) {
        createData.password = hashedPassword;
      }

      user = await User.create(createData);
    }

    // Send welcome email if they were assigned the member role (either new or just assigned)
    if (roles && roles.includes("member") && rawPassword) {
      (async () => {
        try {
          const sent = await sendMemberWelcomeEmail(normalizedEmail, user.name, rawPassword);
          await EmailLog.create({
            recipient: normalizedEmail,
            type: "Welcome",
            subject: "Welcome to Mangal Guruji Foundation! Your Account is Ready",
            status: sent ? "Sent" : "Failed",
            error: sent ? "" : "SMTP failure",
          });
        } catch (err) {
          console.error("Background email error:", err);
        }
      })();
    }

    await logAudit({
      action: isNew ? "user.create" : "user.update",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "User",
      targetId: user._id.toString(),
      message: `${isNew ? "Created" : "Updated"} user ${normalizedEmail} with roles: ${user.roles.join(", ")}`,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Email or Member ID already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save user" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { session, response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await logAudit({
      action: "user.delete",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "User",
      targetId: id,
      message: `Deleted user ${user.email}`,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ success: true, data: { _id: id } });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
