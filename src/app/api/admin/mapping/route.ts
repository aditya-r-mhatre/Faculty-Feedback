import connectDB from "@/lib/db";
import Mapping from "@/models/Mapping";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();
  const data = await req.json(); // facultyId, subjectId, deptId, programId, classYear, division, batch
  const mapping = await Mapping.create(data);
  return NextResponse.json(mapping);
}