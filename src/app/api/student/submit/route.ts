import connectDB from "@/lib/db";
import SubmissionStatus from "@/models/SubmissionStatus";
import FeedbackResponse from "@/models/FeedbackResponse";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";

export async function POST(req: Request) { 
  await connectDB();
  const session = await getServerSession(authOptions);
  
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    
    // DEBUG: Look at your terminal to see exactly what the frontend is sending
    console.log("SUBMISSION BODY:", body);

    // Support both naming conventions to be safe
    const mappingId = body.mappingId || body.formId;
    const { ratings, comments } = body;

    // 1. Precise Validation
    if (!mappingId) {
      return NextResponse.json({ error: "mappingId is missing in request" }, { status: 400 });
    }

    if (!ratings || Object.keys(ratings).length === 0) {
      return NextResponse.json({ error: "ratings are required and cannot be empty" }, { status: 400 });
    }

    // 2. Double Submission Check using the ID from our Session Fix
    const alreadySubmitted = await SubmissionStatus.findOne({ 
      studentId: session.user.id, 
      mappingId 
    });

    if (alreadySubmitted) {
      return NextResponse.json({ error: "You have already submitted this form." }, { status: 400 });
    }

    // 3. Database Operations
    // Mark the status first
    await SubmissionStatus.create({ 
      studentId: session.user.id, 
      mappingId 
    });

    // Create the actual response record
    await FeedbackResponse.create({ 
      mappingId, 
      studentId: session.user.id, 
      ratings, 
      comments 
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Submission error:', err);
    if (err?.code === 11000) {
      return NextResponse.json({ error: 'Already submitted (Duplicate Key)' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}