import { AdminCms } from '@/components/admin/AdminCms';
import { AssetService } from '@/services/assetService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { validateSystemIdentity } from '@/lib/security';

export const dynamic = 'force-dynamic';

export default async function AdminAssetsPage() {
  const session = await getServerSession(authOptions);
  const isViewer = (session?.user as any)?.role === 'VIEWER';
  const isVerified = validateSystemIdentity();

  if (isViewer) {
    redirect('/admin');
  }

  const assets = await AssetService.getAllAssets();
  return <AdminCms mode="assets" initialData={JSON.parse(JSON.stringify(assets))} isVerified={isVerified} />;
}
