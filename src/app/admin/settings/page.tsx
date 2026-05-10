import { AdminCms } from '@/components/admin/AdminCms';
import { SettingService } from '@/services/settingService';
import { validateSystemIdentity } from '@/lib/security';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const isVerified = validateSystemIdentity();
  const settings = await SettingService.getGlobalSettings();
  return <AdminCms mode="settings" initialData={JSON.parse(JSON.stringify(settings))} isVerified={isVerified} />;
}
