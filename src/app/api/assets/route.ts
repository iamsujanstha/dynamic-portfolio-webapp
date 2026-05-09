import { NextResponse } from 'next/server';
import { AssetService } from '@/services/assetService';
import { requireAdmin } from '@/lib/api/admin';

/**
 * Handle asset registration.
 * In a real-world prod app, this would be a "Presigned URL" generator 
 * or a server action that streams the file to S3.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || undefined;
  
  try {
    const assets = await AssetService.getAllAssets(type);
    return NextResponse.json(assets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await req.json();
    
    // Validate required fields
    if (!body.url || !body.name || !body.type) {
      return NextResponse.json({ error: 'Missing required asset fields' }, { status: 400 });
    }

    const asset = await AssetService.registerAsset(body);
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register asset' }, { status: 500 });
  }
}
