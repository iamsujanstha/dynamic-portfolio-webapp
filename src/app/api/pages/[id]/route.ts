import { NextResponse } from 'next/server';
import { PageService } from '@/services/pageService';
import { requireAdmin } from '@/lib/api/admin';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await req.json();
    const page = await PageService.updatePage(params.id, body);
    return NextResponse.json(page);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update page', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    await PageService.deletePage(params.id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete page', message: error.message },
      { status: 500 }
    );
  }
}
