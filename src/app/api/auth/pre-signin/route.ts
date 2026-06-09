import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/db/mongodb';
import User, { UserRole } from '@/src/models/User';
import VerificationCode from '@/src/models/VerificationCode';
import { sendVerificationEmail } from '@/src/lib/mail';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await dbConnect();

    // 1. Check in DB
    const user = await User.findOne({ email });
    let isAllowed = false;
    let targetEmail = email;

    if (user) {
      isAllowed = true;
    }

    // 2. Check Bootstrap Admin if not matched in DB
    const envAdminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const envAdminUser = process.env.ADMIN_USERNAME || 'admin';

    if (!isAllowed && (email === envAdminEmail || email === envAdminUser)) {
      isAllowed = true;
      targetEmail = envAdminEmail; // Send email to the actual admin email, not username 'admin'
    }

    if (!isAllowed) {
      return NextResponse.json({ error: 'Access Denied. Email address not recognized.' }, { status: 401 });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Clean old codes
    await VerificationCode.deleteMany({ email: targetEmail });
    
    // Store verification code
    await VerificationCode.create({
      email: targetEmail,
      code,
      createdAt: new Date()
    });

    // Send email
    console.log(`[AUTH] Generated Verification Code for ${targetEmail}: ${code}`);
    await sendVerificationEmail(targetEmail, code);

    return NextResponse.json({ success: true, requiresVerification: true, email: targetEmail });
  } catch (error) {
    console.error('Error during pre-signin:', error);
    return NextResponse.json({ error: 'A system error occurred.' }, { status: 500 });
  }
}
