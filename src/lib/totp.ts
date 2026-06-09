/**
 * @module lib/totp
 * @description TOTP (Time-based One-Time Password) service layer.
 *
 * Implements RFC 6238 (TOTP) via the `otplib` library.
 * This module is the single source of truth for all TOTP operations.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  ARCHITECTURE                                              │
 * │                                                            │
 * │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
 * │  │  API Routes   │───▶│  totp.ts     │───▶│  crypto.ts   │ │
 * │  │  (consumers)  │    │  (service)   │    │  (encryption)│ │
 * │  └──────────────┘    └──────┬───────┘    └──────────────┘ │
 * │                             │                              │
 * │                      ┌──────▼───────┐                      │
 * │                      │   otplib     │                      │
 * │                      │  (RFC 6238)  │                      │
 * │                      └──────────────┘                      │
 * │                                                            │
 * │  DESIGN PRINCIPLES                                         │
 * │  • Single Responsibility: Only TOTP logic lives here       │
 * │  • Fail-Secure: Missing/invalid data always denies access  │
 * │  • Encapsulation: Consumers never see raw secrets          │
 * └─────────────────────────────────────────────────────────────┘
 */

import { OTP } from 'otplib';
import QRCode from 'qrcode';
import { encrypt, decrypt } from './crypto';

// ─── Configuration ───────────────────────────────────────────────────────────

const TOTP_ISSUER = 'Portfolio Admin';
const TOTP_WINDOW = 1;

// Use Class API to easily pass options
const otp = new OTP();

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TOTPSecretResult {
  secret: string;
  otpauthUri: string;
}

// ─── Secret Generation ──────────────────────────────────────────────────────

export function generateSecret(accountName: string): TOTPSecretResult {
  const secret = otp.generateSecret();

  const otpauthUri = otp.generateURI({
    issuer: TOTP_ISSUER,
    label: accountName,
    secret,
  });

  return { secret, otpauthUri };
}

// ─── QR Code Generation ─────────────────────────────────────────────────────

export async function generateQRCode(otpauthUri: string): Promise<string> {
  return QRCode.toDataURL(otpauthUri, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
}

// ─── Token Verification ─────────────────────────────────────────────────────

export async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    const result = await otp.verify({ token, secret });
    return result.valid;
  } catch (error) {
    console.error('TOTP verification error:', error);
    // Fail-secure: any error (malformed secret, etc.) = deny access
    return false;
  }
}

// ─── Encryption Helpers ─────────────────────────────────────────────────────

export function encryptSecret(secret: string): string {
  return encrypt(secret);
}

export function decryptSecret(encryptedSecret: string): string {
  return decrypt(encryptedSecret);
}
