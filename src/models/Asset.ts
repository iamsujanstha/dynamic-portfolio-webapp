import mongoose, { Schema, Document } from 'mongoose';

export interface IAsset extends Document {
  name: string;
  url: string;
  type: 'IMAGE' | 'PDF' | 'DOC';
  size: number;
  mimeType: string;
  tags: string[];
}

const AssetSchema = new Schema<IAsset>({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['IMAGE', 'PDF', 'DOC'], required: true },
  size: Number,
  mimeType: String,
  tags: [String],
}, { timestamps: true });

export default mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);
