/**
 * @route POST /api/auth/pre-signin
 * @description Pre-authentication check — validates the user's email and
 *              determines whether TOTP is configured.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  FLOW                                                      │
 * │                                                            │
 * │  1. Receive email from the sign-in form                    │
 * │  2. Check if the email exists in DB or matches bootstrap   │
 * │  3. Determine TOTP status:                                 │
 * │     • Bootstrap admin → check TOTP_SECRET env var          │
 * │     • DB user → check user.totpVerified flag               │
 * │  4. Return status to the client:                           │
 * │     • requiresTOTP: true → show authenticator code input   │
 * │     • requiresSetup: true → redirect to TOTP setup page    │
 * │                                                            │
 * │  PREVIOUS BEHAVIOR (Email OTP):                            │
 * │  This route previously generated a random 6-digit code,    │
 * │  stored it in the VerificationCode collection, and sent    │
 * │  it via email. That flow is now replaced by TOTP.          │
 * └─────────────────────────────────────────────────────────────┘
 */

import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/db/mongodb';
import User from '@/src/models/User';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await dbConnect();

    // ── 1. Check in DB ──────────────────────────────────────────
    const user = await User.findOne({ email });
    let isAllowed = false;
    let targetEmail = email;
    let isBootstrap = false;

    if (user) {
      isAllowed = true;
    }

    // ── 2. Check Bootstrap Admin ────────────────────────────────
    const envAdminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const envAdminUser = process.env.ADMIN_USERNAME || 'admin';

    if (email === envAdminEmail || email === envAdminUser) {
      isAllowed = true;
      isBootstrap = true;
      targetEmail = envAdminEmail;
    }

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Access Denied. Email address not recognized.' },
        { status: 401 }
      );
    }

    // ── 3. Determine TOTP Status ────────────────────────────────
    const isTotpEnabled = isBootstrap
      ? !!process.env.TOTP_SECRET        // Bootstrap admin: secret in env var
      : user?.totpVerified === true;      // DB users: check verified flag

    if (!isTotpEnabled) {
      if (isBootstrap) {
        return NextResponse.json(
          { error: 'TOTP is not configured for the bootstrap admin. Please run "node scripts/setup-totp.js" locally, add the TOTP_SECRET to your environment variables, and restart the server.' },
          { status: 403 }
        );
      } else {
        return NextResponse.json(
          { error: 'TOTP is not configured for this account. Please contact the system administrator to generate your authenticator setup key.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      requiresTOTP: true,
      email: targetEmail,
    });
  } catch (error) {
    console.error('[Pre-SignIn] Error:', error);
    return NextResponse.json(
      { error: 'A system error occurred.' },
      { status: 500 }
    );
  }
}

