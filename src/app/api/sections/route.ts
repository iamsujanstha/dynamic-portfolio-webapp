import { NextResponse } from 'next/server';
import { SectionService } from '@/services/sectionService';
import { requireAdmin } from '@/lib/api/admin';

export async function GET() {
  try {
    const sections = await SectionService.getAllSections();
    return NextResponse.json(sections);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch sections', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await req.json();
    const section = await SectionService.createSection(body);
    return NextResponse.json(section, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create section', message: error.message },
      { status: 500 }
    );
  }
}
