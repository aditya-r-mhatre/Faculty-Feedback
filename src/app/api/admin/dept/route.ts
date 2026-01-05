import connectDB from "@/lib/db";
import Department from "@/models/Department";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, hodUsername } = await req.json();

    // 1. Find the user by username first
    const hodUser = await User.findOne({ username: hodUsername });

    if (!hodUser) {
      return NextResponse.json(
        { error: "User not found. Please create the HOD user account first." },
        { status: 404 }
      );
    }

    // 2. Create the Department with the found User's ID
    const dept = await Department.create({ 
      name, 
      hodId: hodUser._id 
    });

    // 3. Update the User: assign the Dept ID and force the HOD role
    await User.findByIdAndUpdate(hodUser._id, { 
      role: 'HOD', 
      deptId: dept._id 
    });

    return NextResponse.json({
      message: "Department created and HOD linked successfully",
      dept
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create department" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const depts = await Department.find({});
    return NextResponse.json(depts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { deptId, hodId } = await req.json();
    if (!deptId || !hodId) {
      return NextResponse.json({ error: 'deptId and hodId are required' }, { status: 400 });
    }

    const dept = await Department.findById(deptId);
    if (!dept) return NextResponse.json({ error: 'Department not found' }, { status: 404 });

    const newHod = await User.findById(hodId);
    if (!newHod) return NextResponse.json({ error: 'HOD user not found' }, { status: 404 });

    // Demote previous HOD if exists
    if (dept.hodId) {
      await User.findByIdAndUpdate(dept.hodId, { role: 'FACULTY', $unset: { deptId: "" } });
    }

    // Assign new HOD
    await Department.findByIdAndUpdate(deptId, { hodId: newHod._id });
    await User.findByIdAndUpdate(newHod._id, { role: 'HOD', deptId: dept._id });

    return NextResponse.json({ message: 'HOD updated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update HOD' }, { status: 500 });
  }
}