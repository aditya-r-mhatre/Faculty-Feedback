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

    // Load models dynamically to ensure they are registered with Mongoose
    const FeedbackResponse = (await import("@/models/FeedbackResponse")).default;
    const FeedbackForm = (await import("@/models/Feedback")).default;

    // 2. Aggregate Data
    const analytics = await FeedbackResponse.aggregate([
      {
        // Join Response with the Form details (Mapping)
        $lookup: {
          from: "feedbackforms", // Confirm this matches your collection name
          localField: "mappingId",
          foreignField: "_id",
          as: "formDetails"
        }
      },
      { $unwind: "$formDetails" },
      {
        // DEPARTMENT SECURITY: Only show forms belonging to the HOD's department
        $match: {
          "formDetails.deptId": new mongoose.Types.ObjectId(hodDeptId)
        }
      },
      {
        // Calculate average across the 'ratings' object values
        $project: {
          mappingId: 1,
          avgResponseRating: {
            $avg: {
              $map: {
                input: { $objectToArray: "$ratings" },
                as: "kv",
                in: "$$kv.v"
              }
            }
          },
          details: "$formDetails"
        }
      },
      {
        // Group results by the Form (Subject/Faculty)
        $group: {
          _id: "$mappingId",
          averageRating: { $avg: "$avgResponseRating" }, 
          count: { $sum: 1 },
          details: { $first: "$details" }
        }
      },
      {
        // Format the output for the HOD Dashboard
        $project: {
          _id: 1,
          averageRating: { $round: ["$averageRating", 2] },
          totalSubmissions: "$count",
          facultyName: { $ifNull: ["$details.facultyName", "Assigned Faculty"] },
          details: {
            subjectName: "$details.title", // Returns "python"
            academicYear: "$details.academicYear" // Returns "FE"
          }
        }
      }
    ]);

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}