import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password?: string;
  role: 'ADMIN' | 'HOD' | 'FACULTY' | 'STUDENT';
  deptId?: mongoose.Types.ObjectId;
  // Student specific fields
  rollNo?: string;
  programId?: mongoose.Types.ObjectId;
  academicYear?: string; // e.g., FE, SE
  division?: string;
  batch?: string;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'HOD', 'FACULTY', 'STUDENT'], required: true },
  deptId: { type: Schema.Types.ObjectId, ref: 'Department' },
  rollNo: { type: String },
  programId: { type: Schema.Types.ObjectId, ref: 'Program' },
  academicYear: { type: String },
  division: { type: String },
  batch: { type: String }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);