import { NextResponse } from 'next/server';
import { SettingService } from '@/services/settingService';

export async function GET() {
  try {
    const settings = await SettingService.getGlobalSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const settings = await SettingService.updateSettings(body);
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
