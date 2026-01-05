import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedbackResponse extends Document {
  mappingId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  ratings: any;
  comments?: string;
}

const FeedbackResponseSchema: Schema = new Schema({
  mappingId: { type: Schema.Types.ObjectId, ref: 'Mapping', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ratings: { type: Schema.Types.Mixed, required: true },
  comments: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.FeedbackResponse || mongoose.model<IFeedbackResponse>('FeedbackResponse', FeedbackResponseSchema);
