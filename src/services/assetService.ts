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
    return (Asset as any).find(query).sort({ createdAt: -1 }).exec();
  }

  static async deleteAsset(id: string) {
    await dbConnect();
    const asset = await (Asset as any).findById(id).exec();
    if (asset && asset.url) {
      const url = asset.url;
      if (url.startsWith('/uploads/')) {
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          const filePath = path.join(process.cwd(), 'public', url);
          await fs.unlink(filePath);
        } catch (err) {
          console.error(`Failed to delete local asset file at ${url}:`, err);
        }
      } else if (url.startsWith('http')) {
        try {
          const { del } = await import('@vercel/blob');
          await del(url);
        } catch (err) {
          console.error(`Failed to delete Vercel Blob at ${url}:`, err);
        }
      }
    }
    return (Asset as any).findByIdAndDelete(id).exec();
  }
}
