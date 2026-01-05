import connectDB from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { deptId, programId } = body || {};

    const baseQuery: any = { role: 'STUDENT' };
    if (deptId) baseQuery.deptId = deptId;
    if (programId) baseQuery.programId = programId;

    const result = await User.updateMany(
    {
        ...baseQuery,
        academicYear: { $in: ['FE', 'SE', 'TE', 'BE'] },
    },
    [
        {
        $set: {
            academicYear: {
            $switch: {
                branches: [
                { case: { $eq: ['$academicYear', 'FE'] }, then: 'SE' },
                { case: { $eq: ['$academicYear', 'SE'] }, then: 'TE' },
                { case: { $eq: ['$academicYear', 'TE'] }, then: 'BE' },
                { case: { $eq: ['$academicYear', 'BE'] }, then: 'GRAD' },
                ],
                default: '$academicYear',
            },
            },
        },
        },
    ],
    { updatePipeline: true } // 🔑 THIS IS REQUIRED
    );


    return NextResponse.json({
      message: 'Promotion completed',
      modified: result.modifiedCount,
    });
  } catch (err: any) {
    console.error('Promotion error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}
