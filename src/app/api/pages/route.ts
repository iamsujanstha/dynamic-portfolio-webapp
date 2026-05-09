import { NextResponse } from 'next/server';
import { PageService } from '@/services/pageService';
import { requireAdmin } from '@/lib/api/admin';

/**
 * GET /api/pages
 * List all pages
 */
export async function GET() {
  try {
    const pages = await PageService.getAllPages();
    return NextResponse.json(pages);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pages
 * Create a new page
 */
export async function POST(req: Request) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await req.json();
    
    // In a real prod app, use Zod for strict validation here
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: 'Missing title or slug' }, { status: 400 });
    }

    const newPage = await PageService.createPage(body);
    return NextResponse.json(newPage, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create page', message: error.message },
      { status: 500 }
    );
  }
}
