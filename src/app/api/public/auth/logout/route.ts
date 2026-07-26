import { NextResponse } from "next/server";
import { clearPublicSession } from "@/lib/public-auth";

export async function POST() {
  await clearPublicSession();
  return NextResponse.json({ success: true });
}
