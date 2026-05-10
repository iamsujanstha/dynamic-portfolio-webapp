import { AdminCms } from '@/components/admin/AdminCms';
import { PageService } from '@/services/pageService';
import { validateSystemIdentity } from '@/lib/security';

export const dynamic = 'force-dynamic';

export default async function AdminPagesPage() {
  const isVerified = validateSystemIdentity();
  const pages = await PageService.getAllPages();
  return <AdminCms mode="pages" initialData={JSON.parse(JSON.stringify(pages))} isVerified={isVerified} />;
}
