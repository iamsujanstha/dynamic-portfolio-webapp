import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PageService } from '@/services/pageService';
import { ProjectService } from '@/services/projectService';
import { AssetService } from '@/services/assetService';
import { Settings, FileText, Layout, Folder, Plus, User, ShieldCheck, AlertTriangle } from 'lucide-react';
import { SeedButton } from '@/src/components/admin/SeedButton';
import { validateSystemIdentity } from '@/lib/security';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  const isIdentityVerified = validateSystemIdentity();
  const isViewer = (session?.user as any)?.role === 'VIEWER';

  const [pages, projects, assets] = await Promise.all([
    PageService.getAllPages(),
    ProjectService.getAllProjects(),
    AssetService.getAllAssets()
  ]);

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            System Overview
          </h1>
          <div className="flex items-center gap-2 text-zinc-500">
            <User size={14} />
            <span className="text-sm font-medium">Operator: {session?.user?.email}</span>
            <span className={`px-2 py-0.5 text-[10px] rounded uppercase font-bold tracking-widest border ${isViewer ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
              }`}>
              {isViewer ? 'VIEWER' : 'ADMIN'}
            </span>
          </div>
        </div>

        {!isIdentityVerified && (
          <div className="px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-red-500 font-bold">Identity Verification Required</h3>
              <p className="text-red-500/70 text-sm">System Identity Key missing or invalid. Please configure your .env with the correct key.</p>
            </div>
          </div>
        )}

        <div className="hidden lg:block text-right">
          <p className="text-zinc-600 text-xs font-mono uppercase">System Node: Asia-South1</p>
          <p className="text-emerald-500 text-xs font-mono">STATUS: OPERATIONAL</p>
        </div>
      </header>

      {isIdentityVerified ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stats / Quick Links */}
            <AdminCard
              title="Pages"
              count={pages.length}
              icon={<Layout className="text-blue-500" />}
              href="/admin/pages"
              isViewer={isViewer}
            />
            <AdminCard
              title="Projects"
              count={projects.length}
              icon={<Folder className="text-amber-500" />}
              href="/admin/projects"
              isViewer={isViewer}
            />
            {!isViewer && (
              <AdminCard
                title="Assets / PDFs"
                count={assets.length}
                icon={<FileText className="text-emerald-500" />}
                href="/admin/assets"
                isViewer={isViewer}
              />
            )}
            <AdminCard
              title="Settings"
              count={1}
              icon={<Settings className="text-zinc-500" />}
              href="/admin/settings"
              isViewer={isViewer}
            />
          </div>

          <section className="mt-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Database Management</h2>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-400 mb-4">
                {isViewer
                  ? "Database operations are restricted in viewer mode."
                  : "If your database is empty, use the seed tool to create standard pages and navigation."}
              </p>
              {isViewer ? (
                <div className="inline-flex items-center gap-2 px-6 py-2 bg-zinc-800 text-zinc-500 rounded-lg text-sm font-bold cursor-not-allowed">
                  <ShieldCheck size={16} /> Seed Locked (Read Only)
                </div>
              ) : (
                <SeedButton />
              )}
            </div>
          </section>
        </>
      ) : (
        <div className="mt-12 flex flex-col items-center justify-center text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
            <AlertTriangle size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-red-500 mb-3">Console Access Denied</h2>
          <p className="text-zinc-500 max-w-md text-sm leading-relaxed">
            All console functions are locked. This instance does not have a valid System Identity Key configured. 
            If you are the owner, set <code className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded text-xs">SYSTEM_IDENTITY_KEY</code> in your <code className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded text-xs">.env</code> file.
          </p>
        </div>
      )}
    </div>
  );
}

function AdminCard({ title, count, icon, href, isViewer }: { title: string, count: number, icon: React.ReactNode, href: string, isViewer: boolean }) {
  return (
    <Link href={href} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-zinc-950 rounded-xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-2xl font-bold">{count}</span>
      </div>
      <div>
        <h3 className="font-semibold text-zinc-300">{title}</h3>
        <p className="text-xs text-zinc-500 mt-1">{isViewer ? 'View all' : 'Manage all'} {title.toLowerCase()}</p>
      </div>
    </Link>
  );
}
