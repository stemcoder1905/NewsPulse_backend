import mongoose, { Schema, Document } from 'mongoose';

export type InteractionEventType =
  | 'impression'
  | 'open'
  | 'view'
  | 'read_complete'
  | 'skip'
  | 'like'
  | 'dislike'
  | 'bookmark'
  | 'share'
  | 'not_interested';

export interface IUserNewsInteraction extends Document {
  userId?: mongoose.Types.ObjectId;
  anonymousUserId?: string;
  articleId: mongoose.Types.ObjectId;
  category: string;
  eventType: InteractionEventType;
  readingDuration?: number; // duration in seconds
  scrollDepth?: number; // percentage 0 - 100
  createdAt: Date;
}

const UserNewsInteractionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    anonymousUserId: { type: String, index: true },
    articleId: { type: Schema.Types.ObjectId, ref: 'NewsArticle', required: true, index: true },
    category: { type: String, required: true, index: true, lowercase: true },
    eventType: {
      type: String,
      required: true,
      enum: [
        'impression',
        'open',
        'view',
        'read_complete',
        'skip',
        'like',
        'dislike',
        'bookmark',
        'share',
        'not_interested'
      ],
      index: true
    },
    readingDuration: { type: Number, default: 0 },
    scrollDepth: { type: Number, default: 0 }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

UserNewsInteractionSchema.index({ userId: 1, eventType: 1 });
UserNewsInteractionSchema.index({ anonymousUserId: 1, eventType: 1 });
UserNewsInteractionSchema.index({ articleId: 1, eventType: 1 });

export default mongoose.model<IUserNewsInteraction>('UserNewsInteraction', UserNewsInteractionSchema);
