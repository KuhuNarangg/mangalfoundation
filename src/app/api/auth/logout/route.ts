import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminSession, ADMIN_COOKIE } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";

export async function POST(req: Request) {
  const session = await getAdminSession();

  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);

  if (session) {
    await logAudit({
      action: "auth.logout",
      actorId: session.id,
      actorUsername: session.username,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });
  }

  return NextResponse.json({ success: true, message: "Logged out successfully" });
}
