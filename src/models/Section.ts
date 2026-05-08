import mongoose, { Schema, Document } from 'mongoose';

export enum SectionType {
  HERO = 'HERO',
  PROJECTS_GRID = 'PROJECTS_GRID',
  EXPERIENCE_TIMELINE = 'EXPERIENCE_TIMELINE',
  SKILLS_CLOUD = 'SKILLS_CLOUD',
  CONTACT_FORM = 'CONTACT_FORM',
  CUSTOM_MARKDOWN = 'CUSTOM_MARKDOWN'
}

export interface ISection extends Document {
  type: SectionType;
  status: 'draft' | 'published';
  title: string;
  subtitle?: string;
  content: any; // Flexible JSON content based on type
  order: number;
  isActive: boolean;
}

const SectionSchema = new Schema<ISection>({
  type: { type: String, enum: Object.values(SectionType), required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  title: { type: String, required: true },
  subtitle: String,
  content: { type: Schema.Types.Mixed, default: {} },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Section = mongoose.models.Section || mongoose.model<ISection>('Section', SectionSchema);
export default Section as mongoose.Model<ISection>;
