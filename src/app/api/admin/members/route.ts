import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Member from "@/models/Member";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/lib/auth";
export async function GET(req: Request) {
  try {
    const auth = await getAdminSession();
    if (!auth || (auth.role !== "super_admin" && auth.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    
    let query: any = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { memberId: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } }
        ]
      };
    }
    
    const members = await Member.find(query).sort({ joiningDate: -1 });
    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAdminSession();
    if (!auth || (auth.role !== "super_admin" && auth.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { name, email, phone, designation, bloodGroup, password } = data;

    if (!name || !phone || !password) {
      return NextResponse.json({ error: "Name, phone, and password are required" }, { status: 400 });
    }

    await connectToDatabase();

    // Generate unique Member ID
    const count = await Member.countDocuments();
    const currentYear = new Date().getFullYear();
    const memberId = `MGF-${currentYear}-${String(count + 1).padStart(4, '0')}`;

    const hashedPassword = await bcrypt.hash(password, 10);

    const member = await Member.create({
      memberId,
      name,
      email: email || undefined,
      phone,
      password: hashedPassword,
      designation: designation || "Volunteer",
      bloodGroup: bloodGroup || "O+",
    });

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "A member with this email or phone already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}
