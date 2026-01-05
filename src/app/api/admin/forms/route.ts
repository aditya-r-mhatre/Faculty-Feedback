import connectDB from "@/lib/db";
import FeedbackForm from "@/models/Feedback"; 
import { NextResponse } from "next/server";

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

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

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const deptId = searchParams.get('deptId');
    const programId = searchParams.get('programId');
    const academicYear = searchParams.get('academicYear');

    const query: any = {};
    if (deptId) query.deptId = deptId;
    if (programId) query.programId = programId;
    if (academicYear) query.academicYear = academicYear;

    const forms = await FeedbackForm.find(query)
      .populate('deptId', 'name')
      .populate('subjectId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(forms || []);
  } catch (error: any) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();

    // Require admin session
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, isActive } = body;
    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const updated = await FeedbackForm.findByIdAndUpdate(id, { isActive }, { new: true }).lean();
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('PATCH forms error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}