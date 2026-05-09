import { NextResponse } from 'next/server';
import { ProjectService } from '@/services/projectService';
import { requireAdmin } from '@/lib/api/admin';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await req.json();
    const project = await ProjectService.updateProject(params.id, body);
    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update project', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    await ProjectService.deleteProject(params.id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete project', message: error.message },
      { status: 500 }
    );
  }
}
