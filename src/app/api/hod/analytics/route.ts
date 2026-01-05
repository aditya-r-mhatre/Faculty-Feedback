import connectDB from "@/lib/db";
import { getServerSession } from "next-auth";
// FIX: Point to your centralized auth-options file
import { authOptions } from "@/lib/auth-options"; 
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    // 1. Verify HOD Session and Role
    if (!session || (session.user as any).role !== "HOD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hodDeptId = (session.user as any).deptId;

    const FeedbackResponse = (await import("@/models/FeedbackResponse")).default;
    const FeedbackForm = (await import("@/models/Feedback")).default;
    const User = (await import("@/models/User")).default;

    // Find all forms that belong to the HOD's department
    const forms = await FeedbackForm.find({ deptId: hodDeptId }).lean();

    const results = [];

    for (const form of forms) {
      const responses = await FeedbackResponse.find({ mappingId: form._id }).lean();

      const totalSubmissions = responses.length;

      // Compute overall average (average of per-response averages)
      let overallAverage = 0;
      if (totalSubmissions > 0) {
        const perResponseAverages = responses.map(r => {
          const vals = Object.values(r.ratings || {}).map(v => Number(v) || 0);
          if (vals.length === 0) return 0;
          return vals.reduce((a,b) => a + b, 0) / vals.length;
        });
        overallAverage = perResponseAverages.reduce((a,b) => a + b, 0) / perResponseAverages.length;
      }

      // Compute per-question averages
      const questionSums: Record<string, { sum: number; count: number }> = {};
      for (const r of responses) {
        const ratingsObj = r.ratings || {};
        for (const [k, v] of Object.entries(ratingsObj)) {
          const val = Number(v) || 0;
          if (!questionSums[k]) questionSums[k] = { sum: 0, count: 0 };
          questionSums[k].sum += val;
          questionSums[k].count += 1;
        }
      }

      const perQuestionAverages = Object.keys(questionSums).sort().map(k => {
        const entry = questionSums[k];
        return { key: k, avg: entry.count ? Math.round((entry.sum / entry.count) * 100) / 100 : 0 };
      });

      // Collect comments
      const comments = responses.filter(r => r.comments && String(r.comments).trim().length > 0).map(r => ({ comment: r.comments, studentId: r.studentId }));

      // Resolve faculty display name: prefer stored `facultyName`, otherwise lookup the user
      let facultyNameToUse = form.facultyName;
      if ((!facultyNameToUse || facultyNameToUse === '') && form.facultyId) {
        try {
          const fu = await User.findById(form.facultyId).select('username').lean();
          facultyNameToUse = fu?.username || 'Assigned Faculty';
        } catch (e) {
          facultyNameToUse = 'Assigned Faculty';
        }
      }

      results.push({
        formId: form._id,
        title: form.title,
        subjectId: form.subjectId,
        facultyId: form.facultyId,
        facultyName: facultyNameToUse || 'Assigned Faculty',
        questions: form.questions || [],
        academicYear: form.academicYear,
        totalSubmissions,
        overallAverage: Math.round(overallAverage * 100) / 100,
        perQuestionAverages,
        comments
      });
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}