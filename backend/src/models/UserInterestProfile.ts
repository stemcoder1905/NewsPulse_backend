import mongoose, { Schema, Document } from 'mongoose';

export interface IUserInterestProfile extends Document {
  userId?: mongoose.Types.ObjectId;
  anonymousUserId?: string;
  categoryScores: Map<string, number>;
  topicScores: Map<string, number>;
  categoryCounts: Map<string, number>;
  clickCount: number;
  totalRead: number;
  lastReadAt?: Date;
  updatedAt: Date;
}

const UserInterestProfileSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true, index: true },
    anonymousUserId: { type: String, unique: true, sparse: true, index: true },
    categoryScores: {
      type: Map,
      of: Number,
      default: {}
    },
    topicScores: {
      type: Map,
      of: Number,
      default: {}
    },
    categoryCounts: {
      type: Map,
      of: Number,
      default: {}
    },
    clickCount: {
      type: Number,
      default: 0
    },
    totalRead: {
      type: Number,
      default: 0
    },
    lastReadAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IUserInterestProfile>('UserInterestProfile', UserInterestProfileSchema);
