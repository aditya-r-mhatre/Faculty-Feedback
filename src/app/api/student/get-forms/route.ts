import connectDB from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    
    // 1. Correct the model import to match your Feedback schema
    // Your screenshot matches the FeedbackForm schema
    const FeedbackForm = (await import("@/models/Feedback")).default;
    const SubmissionStatus = (await import("@/models/SubmissionStatus")).default;
    const Subject = (await import("@/models/Subject")).default; 

    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;

    // 2. Fetch IDs of forms already submitted to hide them
    const submittedRecords = await SubmissionStatus.find({ 
      studentId: user.id 
    }).select("mappingId");
    
    // mappingId in SubmissionStatus refers to the _id of the FeedbackForm
    const submittedIds = submittedRecords.map(rec => rec.mappingId.toString());

    // 3. Build the query using exact matches from your records
    const query: any = {
      deptId: user.deptId, 
      academicYear: user.academicYear, // Matches "FE"
      division: user.division,         // Matches "A"
      isActive: true,
      _id: { $nin: submittedIds }      // This hides the already submitted forms
    };

    // 4. Robust Batch Handling
    if (user.batch && user.batch !== "null") {
      query.$or = [{ batch: user.batch }, { batch: null }, { batch: "" }];
    } else {
      query.$or = [{ batch: null }, { batch: "" }, { batch: { $exists: false } }];
    }

    // Log this to your terminal to verify "FE" is actually being used
    console.log("FINAL MONGODB QUERY:", JSON.stringify(query, null, 2));

    const forms = await FeedbackForm.find(query)
      .populate("subjectId", "name") 
      .lean();

    return NextResponse.json(forms || []);
  } catch (error: any) {
    console.error("Fetch error:", error); 
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}