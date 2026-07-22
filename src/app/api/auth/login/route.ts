import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { signJwtToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";
import { lookupGeo } from "@/lib/geo";
import { logAudit } from "@/lib/audit";
import { sendFailedLoginAlert, sendVpnLoginAlert } from "@/lib/email";
import { loginSchema, formatZodError } from "@/lib/validations";

const MAX_ATTEMPTS = 3;
const LOCK_MINUTES = 2;
// A valid bcrypt hash used only to equalize timing when the user is unknown.
const DUMMY_HASH =
  "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const userAgent = getUserAgent(req);

  try {
    // Coarse per-IP backstop (the per-account lockout below is the main control).
    const rl = await rateLimit(`login:${ip}`, 30, 15 * 60);
    if (!rl.success) {
      await logAudit({
        action: "auth.login",
        status: "failure",
        actorUsername: "unknown",
        message: "Rate limit exceeded",
        ip,
        userAgent,
      });
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = loginSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatZodError(parsed.error) },
        { status: 400 }
      );
    }
    const { username, password, adminCode } = parsed.data;

    await connectToDatabase();
    const admin = await Admin.findOne({ username });

    // Unknown user — burn equivalent time, then respond generically.
    if (!admin) {
      await bcrypt.compare(password, DUMMY_HASH);
      await logAudit({
        action: "auth.login",
        status: "failure",
        actorUsername: username,
        message: "Unknown user",
        ip,
        userAgent,
      });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Reject while locked (2-minute cooldown), before any password comparison.
    if (admin.lockUntil && admin.lockUntil > new Date()) {
      const secondsLeft = Math.ceil((admin.lockUntil.getTime() - Date.now()) / 1000);
      await logAudit({
        action: "auth.login",
        status: "failure",
        actorId: admin._id?.toString(),
        actorUsername: username,
        message: "Attempt while locked",
        ip,
        userAgent,
      });
      return NextResponse.json(
        { error: `Account locked. Try again in ${secondsLeft}s.` },
        { status: 423 }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    const expectedCode = process.env.ADMIN_SECURITY_CODE;
    const isCodeMatch = expectedCode ? adminCode === expectedCode : true;

    if (!isMatch || !isCodeMatch) {
      admin.failedLoginAttempts = (admin.failedLoginAttempts || 0) + 1;
      let locked = false;
      if (admin.failedLoginAttempts >= MAX_ATTEMPTS) {
        admin.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        // Reset so the NEXT 3 wrong attempts re-lock AND re-send the alert.
        admin.failedLoginAttempts = 0;
        locked = true;
      }
      await admin.save();

      if (locked) {
        // Exact location + VPN/proxy check, then alert on this (every 5th) failure.
        const geo = await lookupGeo(ip);
        await logAudit({
          action: "auth.login",
          status: "failure",
          actorId: admin._id?.toString(),
          actorUsername: username,
          message: `Locked after ${MAX_ATTEMPTS} failed attempts${geo.isVpn ? " [VPN/Proxy]" : ""}`,
          metadata: { location: geo.locationString, isp: geo.isp, isVpn: geo.isVpn },
          ip,
          userAgent,
        });
        sendFailedLoginAlert({
          username,
          ip,
          userAgent,
          attempts: MAX_ATTEMPTS,
          time: new Date(),
          location: geo.locationString,
          isVpn: geo.isVpn,
          locked: true,
        }).catch((e) => console.error("Alert email failed:", e));

        return NextResponse.json(
          { error: `Too many failed attempts. Account locked for ${LOCK_MINUTES} minutes.` },
          { status: 423 }
        );
      }

      await logAudit({
        action: "auth.login",
        status: "failure",
        actorId: admin._id?.toString(),
        actorUsername: username,
        message: "Wrong password",
        metadata: { attempts: admin.failedLoginAttempts },
        ip,
        userAgent,
      });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Success — capture exact location + VPN/proxy status.
    const geo = await lookupGeo(ip);
    admin.failedLoginAttempts = 0;
    admin.lockUntil = null;
    admin.lastLoginAt = new Date();
    admin.lastLoginIp = ip;
    admin.lastLoginLocation = geo.locationString;
    await admin.save();

    const token = await signJwtToken(
      { id: admin._id, username: admin.username, role: admin.role || "admin" },
      { exp: "24h" }
    );

    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    await logAudit({
      action: "auth.login",
      status: "success",
      actorId: admin._id?.toString(),
      actorUsername: admin.username,
      message: geo.isVpn ? "Login via VPN/Proxy" : "Login",
      metadata: { location: geo.locationString, isp: geo.isp, isVpn: geo.isVpn },
      ip,
      userAgent,
    });

    // A successful login from a VPN/proxy means the location may be masked — alert.
    if (geo.isVpn) {
      sendVpnLoginAlert({
        username: admin.username,
        ip,
        userAgent,
        location: geo.locationString,
        isp: geo.isp,
        time: new Date(),
      }).catch((e) => console.error("VPN alert email failed:", e));
    }

    return NextResponse.json({ success: true, message: "Logged in successfully" });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
