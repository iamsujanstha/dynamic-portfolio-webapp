import { AdminCms } from '@/components/admin/AdminCms';
import { ProjectService } from '@/services/projectService';
import { validateSystemIdentity } from '@/lib/security';

export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage() {
  const isVerified = validateSystemIdentity();
  const projects = await ProjectService.getAllProjects();
  return <AdminCms mode="projects" initialData={JSON.parse(JSON.stringify(projects))} isVerified={isVerified} />;
}
