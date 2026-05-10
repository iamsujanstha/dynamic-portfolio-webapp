import React from 'react';
import { validateSystemIdentity } from '@/lib/security';
import { AdminLayoutShell } from '@/components/admin/AdminLayoutShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const isVerified = validateSystemIdentity();

  return (
    <AdminLayoutShell isVerified={isVerified}>
      {children}
    </AdminLayoutShell>
  );
}
