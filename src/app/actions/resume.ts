'use server';

import { put, del } from '@vercel/blob';
import { AssetService } from '@/services/assetService';
import { SettingService } from '@/services/settingService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import dbConnect from '@/lib/db/mongodb';
import Asset from '@/src/models/Asset';
import { revalidatePath } from 'next/cache';

const SINGLETON_NAMES = ['Active Resume'];

export async function saveResumeAction(formData: FormData, resumeData: any) {
  try {
    // 1. Authorize: must be Admin
    const session = await getServerSession(authOptions);
    const role = String((session?.user as any)?.role || '').toLowerCase();
    if (!session || role !== 'admin') {
      throw new Error('Unauthorized access');
    }

    const file = formData.get('file') as File;
    const assetName = formData.get('name')?.toString() || file?.name || '';

    if (!file) {
      throw new Error('Missing file');
    }

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isSingleton = SINGLETON_NAMES.includes(assetName);
    let fileUrl: string;

    // Convert file to a raw Node Buffer to bypass Server Action serialization issues on Vercel
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // ── Vercel Blob (production) ──────────────────────────────────────────
      if (isSingleton) {
        // Find and delete the previous blob before uploading the new one
        await dbConnect();
        const prev = await (Asset as any).findOne({ name: assetName }).exec();
        if (prev?.url) {
          try { await del(prev.url); } catch { /* ignore if already gone */ }
          await (Asset as any).findByIdAndDelete(prev._id).exec();
        }
        // Use addRandomSuffix: true so the URL changes every time. 
        // This is crucial to bypass aggressive browser caching of PDFs!
        const blob = await put(`resume/active-resume.pdf`, fileBuffer, {
          access: 'public',
          addRandomSuffix: true,
          contentType: file.type || 'application/pdf',
        });
        fileUrl = blob.url;
      } else {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        const blob = await put(safeName, fileBuffer, {
          access: 'public',
          addRandomSuffix: true,
          contentType: file.type || 'application/octet-stream',
        });
        fileUrl = blob.url;
      }
    } else {
      // ── Local filesystem fallback (development / no Blob token) ───────────
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });

      let filename: string;

      if (isSingleton) {
        // Always write to the same fixed filename — overwrites the previous file
        filename = 'active-resume.pdf';
        const filePath = path.join(uploadsDir, filename);

        // Also delete the old DB record (and its timestamped file if any)
        await dbConnect();
        const prev = await (Asset as any).findOne({ name: assetName }).exec();
        if (prev?.url) {
          // Remove old physical file if it was a local path
          if (prev.url.startsWith('/uploads/')) {
            const oldPath = path.join(process.cwd(), 'public', prev.url);
            try { await unlink(oldPath); } catch { /* already gone */ }
          }
          await (Asset as any).findByIdAndDelete(prev._id).exec();
        }

        await writeFile(filePath, fileBuffer);
      } else {
        // Non-singleton: keep timestamped naming
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        filename = `${Date.now()}-${safeName}`;
        const filePath = path.join(uploadsDir, filename);
        await writeFile(filePath, fileBuffer);
      }

      if (isSingleton) {
        // Append a cache-busting timestamp parameter to the URL
        fileUrl = `/uploads/${filename}?v=${Date.now()}`;
      } else {
        fileUrl = `/uploads/${filename}`;
      }
    }

    // Register asset in DB
    const asset = await AssetService.registerAsset({
      name: assetName,
      url: fileUrl,
      type: isPdf ? 'PDF' : 'IMAGE',
      size: file.size,
      mimeType: file.type,
      tags: formData.get('tags')?.toString().split(',').map(t => t.trim()).filter(Boolean) || [],
    });

    // Update global Settings with new PDF asset URL and JSON data
    await SettingService.updateSettings({
      resumeUrl: asset.url,
      resumeData: resumeData,
    });

    // Clear static page data caches to reflect changes immediately in production/Vercel
    revalidatePath('/admin/resume');
    revalidatePath('/');

    return { success: true, url: asset.url };
  } catch (error: any) {
    console.error('Error in saveResumeAction:', error);
    return { success: false, error: error.message || 'Failed to save resume' };
  }
}
