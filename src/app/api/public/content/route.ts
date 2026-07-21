import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import SiteContent from "@/models/SiteContent";
import { mergeContent } from "@/lib/content";

export async function GET() {
  try {
    await connectToDatabase();
    const doc: any = await SiteContent.findById("singleton").lean();
    return NextResponse.json({ success: true, data: mergeContent(doc?.data) });
  } catch {
    // Always fall back to defaults so the site never breaks.
    return NextResponse.json({ success: true, data: mergeContent(null) });
  }
}
