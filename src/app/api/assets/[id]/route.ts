import { NextResponse } from 'next/server';
import { AssetService } from '@/services/assetService';
import { requireAdmin } from '@/lib/api/admin';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    await AssetService.deleteAsset(params.id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete asset', message: error.message },
      { status: 500 }
    );
  }
}
