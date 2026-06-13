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
  ShieldCheck,
  Menu,
  X,
  Lock,
  FileUser,
} from 'lucide-react';
import { SignOutButton } from '@/src/components/admin/SignOutButton';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export function AdminLayoutShell({ children, isVerified = true }: { children: React.ReactNode; isVerified?: boolean }) {
  const pathname = usePathname();

  const { data: session } = useSession();
  const isViewer = (session?.user as any)?.role === 'VIEWER';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin', adminOnly: false },
    ...(isVerified ? [
      { name: 'Projects', icon: FolderKanban, href: '/admin/projects', adminOnly: false },
      ...(isViewer ? [] : [{ name: 'Assets', icon: ImageIcon, href: '/admin/assets', adminOnly: false }]),
      { name: 'Resume', icon: FileUser, href: '/admin/resume', adminOnly: false },
      { name: 'Profile Settings', icon: Settings, href: '/admin/settings', adminOnly: false },
    ] : []),
  ];

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-zinc-100 font-sans overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isVerified ? 'bg-blue-600' : 'bg-red-600 animate-pulse'}`}>
            {isVerified ? <ShieldCheck size={18} className="text-white" /> : <Lock size={18} className="text-white" />}
          </div>
          <span className="font-bold text-sm tracking-tight">
            {isVerified ? 'Staff Console' : 'LOCKED — Unauthorized'}
          </span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-64 border-r border-zinc-800 bg-[#0A0A0A] flex flex-col z-50 transition-transform duration-300 lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-zinc-800 hidden lg:flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isVerified ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse'}`}>
            {isVerified ? <ShieldCheck size={20} className="text-white" /> : <Lock size={20} className="text-white" />}
          </div>
          <span className="font-bold text-lg tracking-tight">
            {isVerified ? 'Admin Console' : 'LOCKED'}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto lg:pt-4 pt-20">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const isDisabled = isViewer && item.adminOnly;

            if (isDisabled) {
              // Show as a disabled item with lock badge — visible but not clickable
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between px-4 py-3 rounded-xl opacity-40 cursor-not-allowed select-none"
                  title="Admin access required"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className="text-zinc-600" />
                    <span className="text-sm font-medium text-zinc-600">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock size={11} className="text-zinc-600" />
                  </div>
                </div>
              );
            }

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

          {/* Show locked message when not verified */}
          {!isVerified && (
            <div className="mt-6 mx-2 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <Lock size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Access Denied</span>
              </div>
              <p className="text-red-500/60 text-[11px] leading-relaxed">
                Console functions are locked. Valid SYSTEM_IDENTITY_KEY required.
              </p>
            </div>
          )}

          {/* Viewer mode notice */}
          {/* {isVerified && isViewer && (
            <div className="mt-4 mx-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-500 mb-1">
                <Lock size={11} />
                <span className="text-[10px] font-black uppercase tracking-widest">Viewer Mode</span>
              </div>
              <p className="text-amber-500/50 text-[10px] leading-relaxed">
                Locked items require admin access.
              </p>
            </div>
          )} */}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#0A0A0A] to-[#0A0A0A] pt-16 lg:pt-0 flex flex-col">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0">
          {children}
        </div>
      </main>
    </div>
  );
}
