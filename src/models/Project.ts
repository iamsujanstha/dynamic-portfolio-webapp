import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  images: string[];
  tags: string[];
  links: {
    github?: string;
    live?: string;
    caseStudy?: string;
  };
  featured: boolean;
}

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  thumbnail: String,
  images: [String],
  tags: [String],
  links: {
    github: String,
    live: String,
    caseStudy: String,
  },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

const Project = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
export default Project as mongoose.Model<IProject>;
