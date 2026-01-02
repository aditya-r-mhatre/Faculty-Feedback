import mongoose, { Schema } from 'mongoose';

const FeedbackFormSchema = new Schema({
  title: { type: String, required: true },
  deptId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  programId: { type: Schema.Types.ObjectId, ref: 'Program', required: true },
  academicYear: { type: String, required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  facultyId: { type: Schema.Types.ObjectId, ref: 'User' },
  facultyName: { type: String },
  division: { type: String, required: true }, // Added: Target Division (e.g., A or B)
  batch: { type: String }, // Added: Optional Batch (e.g., B1, B2)
  questions: [{
    questionText: { type: String, required: true },
    type: { type: String, enum: ['rating', 'text'], default: 'rating' }
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.FeedbackForm || mongoose.model('FeedbackForm', FeedbackFormSchema);