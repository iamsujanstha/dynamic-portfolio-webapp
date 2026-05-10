import dbConnect from '../lib/db/mongodb';
import Settings from '../models/Settings';
import { validateSystemIdentity } from '../lib/security';

export class SettingService {
  /**
   * Singleton pattern: The site usually has one global settings document
   */
  static async getGlobalSettings() {
    await dbConnect();
    // Return the first setting document found or create default
    let settings = await (Settings as any).findOne({}).lean().exec();
    if (!settings) {
      settings = await (Settings as any).create({ siteName: 'Dynamic Portfolio' });
      settings = settings.toObject ? settings.toObject() : settings;
    }

    // --- Deep Branding Lock ---
    // Use the secure validator (Bcrypt based) to hide the secret key
    if (!validateSystemIdentity()) {
      settings.siteName = `(Unauthorized Copy) ${settings.siteName || 'Portfolio'}`;
      settings.firstName = 'Unauthorized';
      settings.lastName = 'Clone';
      settings.profileDescription = 'This repository is a clone of Sujan Shrestha\'s Dynamic Portfolio Engine. Please provide the correct SYSTEM_IDENTITY_KEY in .env to unlock.';
    }
    // ---------------------------

    return settings;
  }

  static async updateSettings(data: any) {
    await dbConnect();
    const settings = await this.getGlobalSettings();
    return Settings.findByIdAndUpdate(settings._id, data, { new: true }).exec();
  }
}
