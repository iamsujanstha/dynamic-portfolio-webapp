import { NextResponse } from 'next/server';
import { SectionService } from '@/services/sectionService';
import { requireAdmin } from '@/lib/api/admin';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await req.json();
    const section = await SectionService.updateSection(params.id, body);
    return NextResponse.json(section);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update section', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    await SectionService.deleteSection(params.id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete section', message: error.message },
      { status: 500 }
    );
  }
}
