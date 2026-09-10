import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: 'user' | 'admin';
  preferredCategories: string[];
  interests: string[];
  onboardingCompleted: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    preferredCategories: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
    onboardingCompleted: { type: Boolean, default: false },
    refreshToken: { type: String }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IUser>('User', UserSchema);
