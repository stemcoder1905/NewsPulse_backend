import mongoose, { Schema, Document } from 'mongoose';

export type AdEventType = 'ad_requested' | 'impression' | 'click' | 'conversion';

export interface IAdInteraction extends Document {
  userId?: mongoose.Types.ObjectId;
  anonymousUserId?: string;
  adId: string;
  campaignId?: mongoose.Types.ObjectId;
  eventType: AdEventType;
  contextCategories: string[];
  createdAt: Date;
}

const AdInteractionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    anonymousUserId: { type: String, index: true },
    adId: { type: String, required: true, index: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'AdCampaign', index: true },
    eventType: {
      type: String,
      required: true,
      enum: ['ad_requested', 'impression', 'click', 'conversion'],
      index: true
    },
    contextCategories: [{ type: String, lowercase: true }]
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export default mongoose.model<IAdInteraction>('AdInteraction', AdInteractionSchema);
