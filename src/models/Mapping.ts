import mongoose, { Schema, Document } from 'mongoose';

export interface IMapping extends Document {
  facultyId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  deptId: mongoose.Types.ObjectId;
  programId: mongoose.Types.ObjectId;
  classYear: string;
  division: string;
  batch?: string; // Optional: null means the entire division
}

const MappingSchema: Schema = new Schema({
  facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  deptId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  programId: { type: Schema.Types.ObjectId, ref: 'Program', required: true },
  classYear: { type: String, required: true },
  division: { type: String, required: true },
  batch: { type: String, default: null } 
});

export default mongoose.models.Mapping || mongoose.model<IMapping>('Mapping', MappingSchema);