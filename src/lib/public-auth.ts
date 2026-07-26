import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "mangal_guruji_fallback_secret_key";
const key = new TextEncoder().encode(JWT_SECRET);

const PUBLIC_COOKIE_NAME = "mangal_public_session";

export type PublicSession = {
  id: string;
  email: string;
};

export async function createPublicSession(user: { _id: string; email: string }) {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const token = await new SignJWT({ id: user._id.toString(), email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set(PUBLIC_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });
}

export async function getPublicSession(): Promise<PublicSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PUBLIC_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as PublicSession;
  } catch (error) {
    return null;
  }
}

export async function clearPublicSession() {
  const cookieStore = await cookies();
  cookieStore.delete(PUBLIC_COOKIE_NAME);
}
