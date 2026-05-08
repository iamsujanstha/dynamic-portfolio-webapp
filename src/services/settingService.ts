import dbConnect from '../lib/db/mongodb';
import Settings from '../models/Settings';

export class SettingService {
  /**
   * Singleton pattern: The site usually has one global settings document
   */
  static async getGlobalSettings() {
    await dbConnect();
    // Return the first setting document found or create default
    let settings = await (Settings as any).findOne({}).exec();
    if (!settings) {
      settings = await Settings.create({});
    }
    return settings;
  }

  static async updateSettings(data: any) {
    await dbConnect();
    const settings = await this.getGlobalSettings();
    return Settings.findByIdAndUpdate(settings._id, data, { new: true }).exec();
  }
}
