import dbConnect from '../lib/db/mongodb';
import Navigation from '../models/Navigation';

export class NavigationService {
  /**
   * Fetch navigation by key (e.g., 'header')
   * Optimized for frontend display
   */
  static async getNavByKey(key: string) {
    await dbConnect();
    return Navigation.findOne({ key })
      .lean()
      .exec();
  }

  static async updateNav(key: string, items: any[]) {
    await dbConnect();
    return Navigation.findOneAndUpdate(
      { key },
      { items },
      { upsert: true, new: true }
    ).exec();
  }
}
