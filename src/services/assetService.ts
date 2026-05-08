import dbConnect from '../lib/db/mongodb';
import Asset, { IAsset } from '../models/Asset';

export class AssetService {
  /**
   * Tracks a new file in the DB.
   * Note: This service assumes the physical file is already uploaded 
   * to a storage provider (Vercel Blob, S3, etc.) and we are recording the URL.
   */
  static async registerAsset(data: Partial<IAsset>) {
    await dbConnect();
    return Asset.create(data);
  }

  static async getAllAssets(type?: string) {
    await dbConnect();
    const query = type ? { type } : {};
    return Asset.find(query).sort({ createdAt: -1 }).exec();
  }

  static async deleteAsset(id: string) {
    await dbConnect();
    // Logic to actually remove the file from S3 should be added here
    return Asset.findByIdAndDelete(id).exec();
  }
}
