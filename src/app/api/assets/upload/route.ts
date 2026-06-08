import { put, del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { AssetService } from '@/services/assetService';
import { requireAdmin } from '@/lib/api/admin';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import dbConnect from '@/lib/db/mongodb';
import Asset from '@/src/models/Asset';

// Assets whose name matches this are treated as "singleton" — the previous
// file is always deleted before the new one is written.
const SINGLETON_NAMES = ['Active Resume'];

export async function POST(req: Request) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const assetName = formData.get('name')?.toString() || file?.name || '';

    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isSingleton = SINGLETON_NAMES.includes(assetName);
    let fileUrl: string;

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
        // Use a fixed name so Vercel Blob URL stays predictable (addRandomSuffix: false)
        const blob = await put(`resume/active-resume.pdf`, file, {
          access: 'public',
          addRandomSuffix: false,
        });
        fileUrl = blob.url;
      } else {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        const blob = await put(safeName, file, {
          access: 'public',
          addRandomSuffix: true,
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

        const arrayBuffer = await file.arrayBuffer();
        await writeFile(filePath, Buffer.from(arrayBuffer));
      } else {
        // Non-singleton: keep timestamped naming
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        filename = `${Date.now()}-${safeName}`;
        const filePath = path.join(uploadsDir, filename);
        const arrayBuffer = await file.arrayBuffer();
        await writeFile(filePath, Buffer.from(arrayBuffer));
      }

      fileUrl = `/uploads/${filename}`;
    }

    const asset = await AssetService.registerAsset({
      name: assetName,
      url: fileUrl,
      type: isPdf ? 'PDF' : 'IMAGE',
      size: file.size,
      mimeType: file.type,
      tags: formData.get('tags')?.toString().split(',').map(t => t.trim()).filter(Boolean) || [],
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to upload asset', message: error.message },
      { status: 500 }
    );
  }
}
