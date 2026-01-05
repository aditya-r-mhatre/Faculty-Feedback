import connectDB from "@/lib/db";
import Subject from "@/models/Subject";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    // 1. Strict Validation
    if (!body.facultyId || !body.deptId || !body.programId || !body.name) {
      return NextResponse.json({ error: "Missing required fields (Name, Faculty, Dept, or Program)" }, { status: 400 });
    }

    // 2. Data Normalization and Unique Code Generation
    const subjectData = {
      name: body.name,
      // Create a truly unique code if one isn't provided to satisfy the unique index
      code: body.code?.trim() || `SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      facultyId: new mongoose.Types.ObjectId(body.facultyId),
      deptId: new mongoose.Types.ObjectId(body.deptId),
      programId: new mongoose.Types.ObjectId(body.programId),
      academicYear: body.academicYear, // Critical for student targeting
      division: body.division?.toUpperCase().replace("DIV ", ""), // Normalize to "A"
      batch: body.batch?.toUpperCase().replace("BATCH ", "") || null // Normalize to "A1"
    };

    const subject = await Subject.create(subjectData);
    return NextResponse.json(subject);
  } catch (error: any) {
    console.error("Subject POST Error:", error.message);

    // 3. Specific Duplicate Key Error Handling
    if (error.code === 11000) {
      return NextResponse.json(
        { error: `Conflict: A subject with code '${error.keyValue?.code}' already exists.` }, 
        { status: 400 }
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const programId = searchParams.get("programId");
    const deptId = searchParams.get("deptId");
    
    let query: any = {};
    
    // Validate and cast ObjectIds to prevent casting 500 errors
    if (programId && mongoose.isValidObjectId(programId)) {
        query.programId = new mongoose.Types.ObjectId(programId);
    }
    if (deptId && mongoose.isValidObjectId(deptId)) {
        query.deptId = new mongoose.Types.ObjectId(deptId);
    }
    
    // Pass other filters if present
    if (searchParams.get("academicYear")) query.academicYear = searchParams.get("academicYear");
    if (searchParams.get("division")) query.division = searchParams.get("division")?.toUpperCase();

    const subjects = await Subject.find(query)
      .populate("facultyId", "username") 
      .lean();
    
    return NextResponse.json(subjects || []);
  } catch (error: any) {
    console.error("Subject GET Error:", error.message);
    return NextResponse.json([], { status: 500 });
  }
}