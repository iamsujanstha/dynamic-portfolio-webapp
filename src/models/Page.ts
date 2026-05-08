import mongoose, { Schema, Document } from 'mongoose';

export interface IPage extends Document {
  title: string;
  slug: string;
  description?: string;
  status: 'draft' | 'published';
  sections: mongoose.Types.ObjectId[];
  metadata: {
    title: string;
    description: string;
    ogImage?: string;
  };
}

const PageSchema = new Schema<IPage>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  description: String,
  sections: [{ type: Schema.Types.ObjectId, ref: 'Section' }],
  metadata: {
    title: String,
    description: String,
    ogImage: String,
  },
}, { timestamps: true });

export default mongoose.models.Page || mongoose.model<IPage>('Page', PageSchema);
