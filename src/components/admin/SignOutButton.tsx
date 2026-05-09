'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { simulationService } from '@/services/simulationService';

export function SignOutButton() {
  const handleSignOut = () => {
    // Clear simulation storage before signing out
    simulationService.clearAll();
    signOut({ callbackUrl: '/' });
  };

  return (
    <button
      onClick={handleSignOut}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-all text-sm font-medium"
    >
      <LogOut size={18} />
      Sign Out
    </button>
  );
}
