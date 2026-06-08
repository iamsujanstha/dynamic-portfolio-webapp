import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { validateSystemIdentity } from '@/lib/security';
import { ResumeEditor } from '@/src/components/resume/ResumeEditor';

export const dynamic = 'force-dynamic';

export default async function AdminResumePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  const isVerified = validateSystemIdentity();
  if (!isVerified) redirect('/admin');

  return (
    <div className="h-full flex flex-col">
      <ResumeEditor />
    </div>
  );
}
