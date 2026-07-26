import { NextResponse } from "next/server";
import { getPublicSession } from "@/lib/public-auth";

export async function GET() {
  const session = await getPublicSession();
  return NextResponse.json({ user: session });
}
