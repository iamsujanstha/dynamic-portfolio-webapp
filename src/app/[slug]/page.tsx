import { notFound } from 'next/navigation';
import { PageService } from '@/services/pageService';
import { DynamicSectionRenderer } from '@/components/dynamic-render/DynamicSectionRenderer';

interface PageProps {
  params: { slug: string };
}

/**
 * PRODUCTION ARCHITECTURE:
 * 1. Server Component fetches data directly from Service Layer (no HTTP overhead)
 * 2. Incremental Static Regeneration (ISR) ensures fresh data without a full rebuild
 * 3. Dynamic Section Renderer provides flexible UI layout
 */
export default async function DynamicPage({ params }: PageProps) {
  const { slug } = params;
  
  // Directly calling service layer (Server Side)
  const pageData = await PageService.getPageBySlug(slug);

  if (!pageData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* We pass the sections to the dynamic renderer */}
      <DynamicSectionRenderer sections={pageData.sections as any} />
    </main>
  );
}

// Staff Engineer implementation: Generate static parameters for SEO and speed
export async function generateStaticParams() {
  const pages = await PageService.getAllPages();
  return pages.map((page) => ({
    slug: page.slug,
  }));
}

// Revalidate every hour (ISR)
export const revalidate = 3600;
