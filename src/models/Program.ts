import mongoose, { Schema, Document } from 'mongoose';

export interface IProgram extends Document {
  name: string; // e.g., B.Tech, M.Tech
  type: 'UG' | 'PG';
  deptId: mongoose.Types.ObjectId;
  academicYears: string[]; // e.g., ["FE", "SE", "TE", "BE"]
}

const ProgramSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['UG', 'PG'], required: true },
  deptId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  academicYears: [{ type: String, required: true }]
});

export default mongoose.models.Program || mongoose.model<IProgram>('Program', ProgramSchema);