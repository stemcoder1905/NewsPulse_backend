import mongoose, { Schema, Document } from 'mongoose';

export interface INewsArticle extends Document {
  externalId: string;
  title: string;
  shortSummary: string;
  description?: string;
  content?: string;
  sourceName: string;
  sourceUrl?: string;
  articleUrl: string;
  imageUrl?: string;
  author?: string;
  publishedAt: Date;
  category: string;
  tags: string[];
  language: string;
  country: string;
  provider: string;
  viewsCount: number;
  likesCount: number;
  bookmarksCount: number;
  sharesCount: number;
  notInterestedCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NewsArticleSchema: Schema = new Schema(
  {
    externalId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    shortSummary: { type: String, required: true, trim: true },
    description: { type: String },
    content: { type: String },
    sourceName: { type: String, required: true, trim: true },
    sourceUrl: { type: String },
    articleUrl: { type: String, required: true, unique: true, index: true },
    imageUrl: { type: String },
    author: { type: String, default: 'NewsPulse Desk' },
    publishedAt: { type: Date, required: true, index: true },
    category: { type: String, required: true, index: true, lowercase: true },
    tags: [{ type: String, lowercase: true }],
    language: { type: String, default: 'en' },
    country: { type: String, default: 'in' },
    provider: { type: String, required: true, index: true },
    viewsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    bookmarksCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    notInterestedCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  {
    timestamps: true
  }
);

NewsArticleSchema.index({ title: 'text', shortSummary: 'text', tags: 'text' });
NewsArticleSchema.index({ category: 1, publishedAt: -1 });
NewsArticleSchema.index({ publishedAt: -1 });

export default mongoose.model<INewsArticle>('NewsArticle', NewsArticleSchema);
