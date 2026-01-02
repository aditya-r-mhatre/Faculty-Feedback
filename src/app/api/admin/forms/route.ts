import connectDB from "@/lib/db";
import FeedbackForm from "@/models/Feedback"; 
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    // De-structure division and batch from the request body
    const { 
      title, 
      deptId, 
      programId, 
      academicYear, 
      subjectId, 
      division, // Added
      batch,    // Added
      facultyId,
      questions 
    } = body;

    // Validation for required fields
    if (!division) {
      return NextResponse.json({ error: "Division is required for targeting students." }, { status: 400 });
    }

    if (!facultyId) {
      return NextResponse.json({ error: "facultyId is required - please select the faculty teaching this subject." }, { status: 400 });
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: "At least one question is required." }, { status: 400 });
    }

    // Fetch faculty to store name (for easy display in analytics)
    const User = (await import('@/models/User')).default;
    const facultyUser = facultyId ? await User.findById(facultyId).select('username') : null;

    const newForm = await FeedbackForm.create({
      title,
      deptId,
      programId,
      academicYear,
      subjectId,
      division: division.toUpperCase(), // Normalize to uppercase
      batch: batch ? batch.toUpperCase() : null, // Optional field
      questions,
      facultyId: facultyId || null,
      facultyName: facultyUser?.username || undefined
    });

    return NextResponse.json(newForm, { status: 201 });
  } catch (error: any) {
    console.error("Form Creation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    // Return an empty array instead of null to prevent "Unexpected end of JSON input"
    const forms = await FeedbackForm.find({})
      .populate("deptId", "name")
      .populate("subjectId", "name")
      .lean();
      
    return NextResponse.json(forms || []);
  } catch (error: any) {
    return NextResponse.json([], { status: 500 });
  }
}