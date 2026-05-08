import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PageService } from '@/services/pageService';
import { ProjectService } from '@/services/projectService';
import { AssetService } from '@/services/assetService';
import { Settings, FileText, Layout, Folder, Plus, User } from 'lucide-react';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
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
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] rounded uppercase font-bold tracking-widest border border-blue-500/20">
              {(session?.user as any)?.role || 'ADMIN'}
            </span>
          </div>
        </div>
        <div className="hidden lg:block text-right">
          <p className="text-zinc-600 text-xs font-mono uppercase">System Node: Asia-South1</p>
          <p className="text-emerald-500 text-xs font-mono">STATUS: OPERATIONAL</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stats / Quick Links */}
          <AdminCard 
            title="Pages" 
            count={pages.length} 
            icon={<Layout className="text-blue-500" />} 
            href="/admin/pages"
          />
          <AdminCard 
            title="Projects" 
            count={projects.length} 
            icon={<Folder className="text-amber-500" />} 
            href="/admin/projects"
          />
          <AdminCard 
            title="Assets / PDFs" 
            count={assets.length} 
            icon={<FileText className="text-emerald-500" />} 
            href="/admin/assets"
          />
          <AdminCard 
            title="Settings" 
            count={1} 
            icon={<Settings className="text-zinc-500" />} 
            href="/admin/settings"
          />
        </div>

      <section className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Ready to Seed</h2>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-zinc-400 mb-4">
            If your database is empty, use the seed tool to create standard pages and navigation.
          </p>
          <Link 
            href="/api/admin/seed" 
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-all"
          >
            <Plus size={16} /> Trigger Database Seed
          </Link>
        </div>
      </section>
    </div>
  );
}

function AdminCard({ title, count, icon, href }: { title: string, count: number, icon: React.ReactNode, href: string }) {
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
        <p className="text-xs text-zinc-500 mt-1">Manage all {title.toLowerCase()}</p>
      </div>
    </Link>
  );
}
