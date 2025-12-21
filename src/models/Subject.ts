import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, unique: true, required: true }, //
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deptId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  programId: { type: mongoose.Schema.Types.ObjectId, ref: "Program", required: true },
  academicYear: { type: String, required: true }, // e.g., "FE"
  division: { type: String, required: true },     // e.g., "A"
  batch: { type: String, default: null }
}, { timestamps: true });

export default mongoose.models.Subject || mongoose.model("Subject", SubjectSchema);