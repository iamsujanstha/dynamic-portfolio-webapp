import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { AssetService } from '@/services/assetService';
import { requireAdmin } from '@/lib/api/admin';

export async function POST(req: Request) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    // --- NEW LOGIC: Upload to Vercel Blob instead of local FS ---
    const blob = await put(file.name, file, {
      access: 'public',
    });

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const asset = await AssetService.registerAsset({
      name: formData.get('name')?.toString() || file.name,
      url: blob.url, // Use the new blob URL
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
