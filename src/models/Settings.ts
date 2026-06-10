import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  siteName: string;
  siteLogo?: string; // Reference to Asset URL
  firstName?: string;
  lastName?: string;
  profileDescription?: string;
  profilePicture?: string; // Reference to Profile Picture URL
  resumeUrl?: string; // Reference to active Resume PDF
  resumeData?: any; // Structured JSON data of the resume
  resumeStyle?: any; // Structured style options of the resume
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  contactEmail: string;
  contactNumber?: string;
  location?: string;
  gaTrackingId?: string;
  maintenanceMode: boolean;
  primaryColor?: string;
}

const SettingsSchema = new Schema<ISettings>({
  siteName: { type: String, default: 'My Portfolio' },
  siteLogo: String,
  firstName: String,
  lastName: String,
  profileDescription: String,
  profilePicture: String,
  resumeUrl: String,
  resumeData: Schema.Types.Mixed,
  resumeStyle: Schema.Types.Mixed,
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
  },
  contactEmail: String,
  contactNumber: String,
  location: String,
  gaTrackingId: String,
  maintenanceMode: { type: Boolean, default: false },
  primaryColor: { type: String, default: '#2563eb' },
}, { timestamps: true });

const Settings = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
export default Settings as mongoose.Model<ISettings>;
