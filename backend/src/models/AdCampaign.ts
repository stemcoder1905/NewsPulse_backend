import mongoose, { Schema, Document } from 'mongoose';

export interface IAdCampaign extends Document {
  adId: string;
  title: string;
  sponsorName: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  callToAction: string;
  targetCategories: string[];
  targetTopics: string[];
  isActive: boolean;
  impressionsCount: number;
  clicksCount: number;
  conversionsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdCampaignSchema: Schema = new Schema(
  {
    adId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    sponsorName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    targetUrl: { type: String, required: true },
    callToAction: { type: String, default: 'Learn More' },
    targetCategories: [{ type: String, lowercase: true }],
    targetTopics: [{ type: String, lowercase: true }],
    isActive: { type: Boolean, default: true, index: true },
    impressionsCount: { type: Number, default: 0 },
    clicksCount: { type: Number, default: 0 },
    conversionsCount: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IAdCampaign>('AdCampaign', AdCampaignSchema);
