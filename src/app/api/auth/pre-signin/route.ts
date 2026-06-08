import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/db/mongodb';
import User, { UserRole } from '@/src/models/User';
import VerificationCode from '@/src/models/VerificationCode';
import { sendVerificationEmail } from '@/src/lib/mail';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    await dbConnect();

    // 1. Check in DB
    const user = await User.findOne({ email }).select('+password');
    let isMatch = false;
    let isAdmin = false;
    let targetEmail = email;

    if (user) {
      isMatch = await bcrypt.compare(password, user.password || '');
      isAdmin = user.role === UserRole.ADMIN;
    }

    // 2. Check Bootstrap Admin if not matched in DB
    const envAdminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const envAdminUser = process.env.ADMIN_USERNAME || 'admin';
    const envAdminPass = process.env.ADMIN_PASSWORD || 'password123';

    if (!isMatch && (email === envAdminEmail || email === envAdminUser)) {
      if (password === envAdminPass) {
        isMatch = true;
        isAdmin = true;
        targetEmail = envAdminEmail; // Send email to the actual admin email, not username 'admin'
      }
    }

    if (!isMatch) {
      return NextResponse.json({ error: 'Access Denied. Check your credentials.' }, { status: 401 });
    }

    if (isAdmin) {
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
    }

    // Non-admin user can proceed without OTP
    return NextResponse.json({ success: true, requiresVerification: false });
  } catch (error) {
    console.error('Error during pre-signin:', error);
    return NextResponse.json({ error: 'A system error occurred.' }, { status: 500 });
  }
}
