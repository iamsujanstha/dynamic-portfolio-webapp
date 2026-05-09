'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Settings,
  Image as ImageIcon,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { SignOutButton } from '@/src/components/admin/SignOutButton';
import { useSession } from 'next-auth/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const { data: session } = useSession();
  const isViewer = (session?.user as any)?.role === 'VIEWER';

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Pages', icon: FileText, href: '/admin/pages' },
    { name: 'Projects', icon: FolderKanban, href: '/admin/projects' },
    ...(isViewer ? [] : [{ name: 'Assets', icon: ImageIcon, href: '/admin/assets' }]),
    { name: 'Profile Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-zinc-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Staff Console</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between group px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'bg-blue-600/10 text-blue-500'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={`transition-colors ${isActive ? 'text-blue-500' : 'group-hover:text-blue-500'}`} />
                  <span className={`text-sm font-medium ${isActive ? 'text-blue-500' : ''}`}>{item.name}</span>
                </div>
                <ChevronRight size={14} className={`transition-all ${isActive ? 'opacity-100 translate-x-0 text-blue-500' : 'opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0'}`} />
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#0A0A0A] to-[#0A0A0A]">
        <div className="p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
