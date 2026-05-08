import React from 'react';
import Link from 'next/link';
import { NavigationService } from '@/services/navigationService';
import { SettingService } from '@/services/settingService';

/**
 * PRODUCTION PATTERN: 
 * Layout components are Server Components that fetch data directly from services.
 * This avoids client-side waterfall requests.
 */
export const Navbar = async () => {
  // Parallel fetching of nav and global settings
  const [navData, settings] = await Promise.all([
    NavigationService.getNavByKey('header'),
    SettingService.getGlobalSettings()
  ]);

  const navItems = navData?.items || [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          {settings.siteName}
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item: any) => (
            <Link 
              key={item.href} 
              href={item.href}
              target={item.isExternal ? "_blank" : undefined}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors">
            Get in Touch
          </button>
        </div>
      </div>
    </header>
  );
};
