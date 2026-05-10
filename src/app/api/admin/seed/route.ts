import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { requireAdmin } from '@/lib/api/admin';
import { validateSystemIdentity } from '@/src/lib/security';

export async function POST() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  if (!validateSystemIdentity()) {
    return NextResponse.json({ error: 'System Identity Verification Failed. Seeding is locked for this instance.' }, { status: 403 });
  }

  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
