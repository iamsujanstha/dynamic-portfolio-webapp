import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { requireAdmin } from '@/lib/api/admin';

export async function POST() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
