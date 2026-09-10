import mongoose, { Schema, Document } from 'mongoose';

export interface IUserReadHistory extends Document {
  userId?: mongoose.Types.ObjectId;
  anonymousUserId?: string;
  articleId?: mongoose.Types.ObjectId;
  articleUrl: string;
  title: string;
  category: string;
  sourceName?: string;
  imageUrl?: string;
  publishedAt?: Date;
  readAt: Date;
  createdAt: Date;
}

const UserReadHistorySchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    anonymousUserId: { type: String, index: true },
    articleId: { type: Schema.Types.ObjectId, ref: 'NewsArticle', index: true },
    articleUrl: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true, lowercase: true, index: true },
    sourceName: { type: String, default: 'Source' },
    imageUrl: { type: String },
    publishedAt: { type: Date },
    readAt: { type: Date, default: Date.now, index: true }
  },
  {
    timestamps: true
  }
);

// Compound indexes for fast lookup and deduplication
UserReadHistorySchema.index({ userId: 1, articleUrl: 1 });
UserReadHistorySchema.index({ anonymousUserId: 1, articleUrl: 1 });
UserReadHistorySchema.index({ anonymousUserId: 1, readAt: -1 });

export default mongoose.model<IUserReadHistory>('UserReadHistory', UserReadHistorySchema);
