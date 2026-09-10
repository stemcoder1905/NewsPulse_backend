import mongoose, { Schema, Document } from 'mongoose';

export interface IAppConfiguration extends Document {
  key: string;
  adFrequency: number;
  recommendationWeights: {
    interest: number;
    freshness: number;
    engagement: number;
    preference: number;
    diversity: number;
  };
  enabledProviders: string[];
  updatedAt: Date;
}

const AppConfigurationSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global_config' },
    adFrequency: { type: Number, default: 5 },
    recommendationWeights: {
      interest: { type: Number, default: 0.40 },
      freshness: { type: Number, default: 0.25 },
      engagement: { type: Number, default: 0.15 },
      preference: { type: Number, default: 0.10 },
      diversity: { type: Number, default: 0.10 }
    },
    enabledProviders: [{ type: String, default: ['newsapi', 'googlenews', 'mock'] }]
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IAppConfiguration>('AppConfiguration', AppConfigurationSchema);
