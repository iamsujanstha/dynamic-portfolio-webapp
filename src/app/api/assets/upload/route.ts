import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { AssetService } from '@/services/assetService';
import { requireAdmin } from '@/lib/api/admin';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function POST(req: Request) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
    const uniqueName = `${Date.now()}-${safeName}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, uniqueName), bytes);

    const isPdf = file.type === 'application/pdf' || safeName.endsWith('.pdf');
    const asset = await AssetService.registerAsset({
      name: formData.get('name')?.toString() || file.name,
      url: `/uploads/${uniqueName}`,
      type: isPdf ? 'PDF' : 'IMAGE',
      size: file.size,
      mimeType: file.type,
      tags: formData.get('tags')?.toString().split(',').map((tag) => tag.trim()).filter(Boolean) || [],
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to upload asset', message: error.message },
      { status: 500 }
    );
  }
}
