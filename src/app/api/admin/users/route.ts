import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    // DEBUG: Look at your terminal to see if academicYear is present here
    console.log("POST request body:", body);

    const { 
      username, 
      password, 
      role, 
      deptId, 
      programId, 
      rollNo, 
      division, 
      batch,
      academicYear // This must match the key sent from frontend
    } = body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      role,
      deptId: deptId || null,
      programId: programId || null,
      rollNo: rollNo || null,
      division: division || null,
      batch: batch || null,
      academicYear: academicYear || null, // Matches your IUser interface
      isFirstLogin: true
    });

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    const query = role ? { role } : {};
    const users = await User.find(query).select("-password").sort({ username: 1 });

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}