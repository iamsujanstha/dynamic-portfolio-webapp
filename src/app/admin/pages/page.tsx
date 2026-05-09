import { AdminCms } from '@/components/admin/AdminCms';
import { PageService } from '@/services/pageService';

export const dynamic = 'force-dynamic';

export default async function AdminPagesPage() {
  const pages = await PageService.getAllPages();
  return <AdminCms mode="pages" initialData={JSON.parse(JSON.stringify(pages))} />;
}
