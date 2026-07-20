import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Package from "@/models/Package";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectToDatabase();
    // Populate categoryId to get the category title
    const packages = await Package.find().populate("categoryId", "title").sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: packages });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectToDatabase();
    const newPackage = await Package.create(body);
    return NextResponse.json({ success: true, data: newPackage }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}
