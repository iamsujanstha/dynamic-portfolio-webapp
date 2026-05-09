import { AdminCms } from '@/components/admin/AdminCms';
import { AssetService } from '@/services/assetService';

export const dynamic = 'force-dynamic';

export default async function AdminAssetsPage() {
  const assets = await AssetService.getAllAssets();
  return <AdminCms mode="assets" initialData={JSON.parse(JSON.stringify(assets))} />;
}
