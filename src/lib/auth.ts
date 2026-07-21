import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyJwtToken } from "./jwt";

export type AdminRole = "super_admin" | "admin" | "editor";

export type AdminSession = {
  id: string;
  username: string;
  role: AdminRole;
};

export const ADMIN_COOKIE = "admin_token";

/** Read and verify the admin session from the request cookie (Node runtime). */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyJwtToken(token);
  if (!payload || !payload.id) return null;

  return {
    id: String(payload.id),
    username: String(payload.username ?? ""),
    role: (payload.role as AdminRole) ?? "admin",
  };
}

/**
 * In-route guard (defense-in-depth alongside proxy.ts). Usage:
 *
 *   const { session, response } = await requireAdmin();
 *   if (response) return response;    // 401/403 already prepared
 *   // ...session is now non-null
 */
export async function requireAdmin(
  roles?: AdminRole[]
): Promise<
  | { session: AdminSession; response: null }
  | { session: null; response: NextResponse }
> {
  const session = await getAdminSession();
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (roles && !roles.includes(session.role)) {
    return {
      session: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { session, response: null };
}
