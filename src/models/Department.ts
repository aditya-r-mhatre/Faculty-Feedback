import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  hodId: mongoose.Types.ObjectId;
}

const DepartmentSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  hodId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

export default mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);