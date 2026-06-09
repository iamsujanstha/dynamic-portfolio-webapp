/**
 * @route POST /api/auth/totp/verify-setup
 * @description Confirms the user has successfully set up their authenticator app
 *              by validating a test TOTP token.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  WHY THIS ENDPOINT EXISTS                                  │
 * │                                                            │
 * │  TOTP setup is a two-phase process:                        │
 * │                                                            │
 * │  Phase 1 (/totp/setup):                                    │
 * │    • Server generates secret → stores encrypted in DB      │
 * │    • Client receives QR code → user scans with phone app   │
 * │    • At this point, totpVerified = false                   │
 * │                                                            │
 * │  Phase 2 (/totp/verify-setup):     ← THIS ENDPOINT        │
 * │    • User enters a 6-digit code from their app             │
 * │    • Server validates it against the stored secret         │
 * │    • On success: sets totpVerified = true                  │
 * │                                                            │
 * │  This two-phase approach prevents lockout: if the user     │
 * │  generates a secret but doesn't scan the QR, they can      │
 * │  still log in (TOTP isn't enforced until verified).        │
 * └─────────────────────────────────────────────────────────────┘
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import dbConnect from '@/src/lib/db/mongodb';
import User from '@/src/models/User';
import { verifyToken, decryptSecret } from '@/src/lib/totp';

export async function POST(request: Request) {
  try {
    // ── 1. Authentication Gate ─────────────────────────────────
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // ── 2. Parse & Validate Input ──────────────────────────────
    const { token } = await request.json();

    if (!token || typeof token !== 'string' || !/^\d{6}$/.test(token)) {
      return NextResponse.json(
        { error: 'A valid 6-digit code is required' },
        { status: 400 }
      );
    }

    // ── 3. Fetch Encrypted Secret ──────────────────────────────
    await dbConnect();

    // Use select('+totpSecret') to explicitly fetch the excluded field
    const user = await User.findOne({ email: session.user.email })
      .select('+totpSecret');

    if (!user?.totpSecret) {
      return NextResponse.json(
        { error: 'No TOTP secret found. Please run setup first.' },
        { status: 400 }
      );
    }

    // ── 4. Decrypt & Verify ────────────────────────────────────
    const plainSecret = decryptSecret(user.totpSecret);
    const isValid = await verifyToken(token, plainSecret);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid code. Please try again with a fresh code from your app.' },
        { status: 400 }
      );
    }

    // ── 5. Mark as Verified ────────────────────────────────────
    await User.findByIdAndUpdate(user._id, { totpVerified: true });

    return NextResponse.json({
      success: true,
      message: 'Authenticator app verified successfully. TOTP is now active.',
    });
  } catch (error) {
    console.error('[TOTP Verify Setup] Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify TOTP setup' },
      { status: 500 }
    );
  }
}
