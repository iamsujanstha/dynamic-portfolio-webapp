/**
 * @module lib/crypto
 * @description AES-256-GCM encryption utilities for securing sensitive data at rest.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  DESIGN DECISIONS                                          │
 * │                                                            │
 * │  • AES-256-GCM chosen over AES-CBC because GCM provides   │
 * │    both confidentiality AND integrity (authenticated       │
 * │    encryption). A tampered ciphertext will fail to         │
 * │    decrypt — no silent corruption.                         │
 * │                                                            │
 * │  • Encryption key is derived from NEXTAUTH_SECRET using    │
 * │    SHA-256 to normalize it to exactly 32 bytes.            │
 * │    This avoids requiring a separate ENCRYPTION_KEY env.    │
 * │                                                            │
 * │  • Output format: "iv:authTag:ciphertext" (all hex).      │
 * │    Storing as a single string simplifies DB storage        │
 * │    while keeping components separable for decryption.      │
 * │                                                            │
 * │  • A unique random IV is generated per encryption call,    │
 * │    ensuring identical plaintexts produce different          │
 * │    ciphertexts (semantic security).                        │
 * └─────────────────────────────────────────────────────────────┘
 *
 * @example
 * ```ts
 * import { encrypt, decrypt } from '@/src/lib/crypto';
 *
 * const encrypted = encrypt('my-totp-secret');
 * // => "a1b2c3...:d4e5f6...:789abc..."
 *
 * const decrypted = decrypt(encrypted);
 * // => "my-totp-secret"
 * ```
 */

import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

// ─── Constants ───────────────────────────────────────────────────────────────

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;        // 128-bit IV (NIST recommended for GCM)
const AUTH_TAG_LENGTH = 16;  // 128-bit authentication tag
const SEPARATOR = ':';       // Delimiter for iv:authTag:ciphertext format

// ─── Key Derivation ─────────────────────────────────────────────────────────

/**
 * Derives a 256-bit encryption key from the NEXTAUTH_SECRET.
 *
 * Why SHA-256? The NEXTAUTH_SECRET can be any length string.
 * SHA-256 deterministically produces exactly 32 bytes (256 bits),
 * which is the exact key size AES-256 requires.
 *
 * @throws {Error} If NEXTAUTH_SECRET is not configured
 */
function deriveKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error(
      '[Crypto] NEXTAUTH_SECRET is not set. ' +
      'Cannot derive encryption key without it.'
    );
  }

  return createHash('sha256').update(secret).digest();
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Encrypts a plaintext string using AES-256-GCM.
 *
 * @param plaintext - The string to encrypt (e.g., a TOTP secret)
 * @returns Encrypted string in format "iv:authTag:ciphertext" (hex-encoded)
 *
 * @example
 * const token = encrypt('JBSWY3DPEHPK3PXP');
 * // Store `token` in MongoDB — it's safe at rest
 */
export function encrypt(plaintext: string): string {
  const key = deriveKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:ciphertext
  return [
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted,
  ].join(SEPARATOR);
}

/**
 * Decrypts a ciphertext string produced by `encrypt()`.
 *
 * @param encryptedText - String in format "iv:authTag:ciphertext"
 * @returns The original plaintext
 * @throws {Error} If the ciphertext has been tampered with (GCM auth fails)
 *
 * @example
 * const secret = decrypt(user.totpSecret);
 * // Use `secret` to verify a TOTP token
 */
export function decrypt(encryptedText: string): string {
  const key = deriveKey();

  const parts = encryptedText.split(SEPARATOR);
  if (parts.length !== 3) {
    throw new Error(
      '[Crypto] Invalid encrypted text format. Expected "iv:authTag:ciphertext".'
    );
  }

  const [ivHex, authTagHex, ciphertext] = parts;

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
