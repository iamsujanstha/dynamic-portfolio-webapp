/**
 * @route POST /api/auth/totp/setup
 * @description Generates a new TOTP secret and returns a QR code for the user.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  SECURITY MODEL                                            │
 * │                                                            │
 * │  This endpoint is PROTECTED:                               │
 * │  • Requires an active NextAuth session                     │
 * │  • Only ADMIN role users can set up TOTP                   │
 * │  • The generated secret is encrypted before DB storage     │
 * │  • The raw secret is NEVER logged or persisted in plaintext│
 * │                                                            │
 * │  FLOW                                                      │
 * │  1. Verify session → must be authenticated admin           │
 * │  2. Generate TOTP secret + otpauth URI                     │
 * │  3. Encrypt secret with AES-256-GCM                        │
 * │  4. Store encrypted secret on the User document            │
 * │  5. Generate QR code from otpauth URI                      │
 * │  6. Return QR code data URI + manual entry key to client   │
 * │                                                            │
 * │  The user's totpVerified remains false until they           │
 * │  successfully verify a code via /totp/verify-setup.        │
 * │  This prevents lockout if the user generates a secret      │
 * │  but never actually scans it.                              │
 * └─────────────────────────────────────────────────────────────┘
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import dbConnect from '@/src/lib/db/mongodb';
import User from '@/src/models/User';
import { generateSecret, generateQRCode, encryptSecret } from '@/src/lib/totp';

export async function POST() {
  try {
    // ── 1. Authentication Gate ─────────────────────────────────
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can set up TOTP' },
        { status: 403 }
      );
    }

    // ── 2. Generate TOTP Secret ────────────────────────────────
    const { secret, otpauthUri } = generateSecret(session.user.email);

    // ── 3. Encrypt & Store ─────────────────────────────────────
    await dbConnect();

    const encryptedSecret = encryptSecret(secret);

    await User.findOneAndUpdate(
      { email: session.user.email },
      {
        totpSecret: encryptedSecret,
        totpVerified: false, // Reset — requires re-verification
      }
    );

    // ── 4. Generate QR Code ────────────────────────────────────
    const qrCodeDataUri = await generateQRCode(otpauthUri);

    // ── 5. Return to Client ────────────────────────────────────
    return NextResponse.json({
      qrCodeDataUri,
      manualEntryKey: secret,  // Shown as text fallback for manual entry
    });
  } catch (error) {
    console.error('[TOTP Setup] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate TOTP setup' },
      { status: 500 }
    );
  }
}
