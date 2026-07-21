import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const { session, response } = await requireAdmin();
  if (response) return response;
  return NextResponse.json({ success: true, data: session });
}
