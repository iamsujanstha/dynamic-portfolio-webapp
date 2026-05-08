import { NextResponse } from 'next/server';
import { NavigationService } from '@/services/navigationService';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key') || 'header';
  
  try {
    const nav = await NavigationService.getNavByKey(key);
    return NextResponse.json(nav);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch navigation' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nav = await NavigationService.updateNav(body.key, body.items);
    return NextResponse.json(nav);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update navigation' }, { status: 500 });
  }
}
