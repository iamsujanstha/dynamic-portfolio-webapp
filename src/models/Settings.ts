import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  siteName: string;
  siteLogo?: string; // Reference to Asset URL
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  contactEmail: string;
  gaTrackingId?: string;
  maintenanceMode: boolean;
}

const SettingsSchema = new Schema<ISettings>({
  siteName: { type: String, default: 'My Portfolio' },
  siteLogo: String,
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
  },
  contactEmail: String,
  gaTrackingId: String,
  maintenanceMode: { type: Boolean, default: false },
}, { timestamps: true });

const Settings = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
export default Settings as mongoose.Model<ISettings>;
