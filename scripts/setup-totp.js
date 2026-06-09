/**
 * Bootstrap Admin TOTP Setup Script
 * 
 * Run this script locally to generate a TOTP secret for the bootstrap admin.
 * It will output a QR code to your terminal that you can scan with your authenticator app.
 * 
 * Usage:
 * node scripts/setup-totp.js
 */

const { OTP } = require('otplib');
const qrcode = require('qrcode');

// Load environment variables if needed, though we only really need the admin email
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  TOTP Setup for Bootstrap Admin                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const issuer = 'Portfolio Admin';

  const otp = new OTP();

  // 1. Generate a new secret
  const secret = otp.generateSecret();
  
  // 2. Generate the otpauth URI
  const otpauthUri = otp.generateURI({
    issuer,
    label: adminEmail,
    secret
  });

  // 3. Print the QR code to the terminal
  console.log('Scan this QR code with Google Authenticator, Authy, or 1Password:\n');
  
  // Generate QR code as terminal string (small version)
  qrcode.toString(otpauthUri, { type: 'terminal', small: true }, (err, url) => {
    if (err) {
      console.error('Failed to generate QR code:', err);
      return;
    }
    
    console.log(url);
    
    console.log('\nIf you cannot scan the QR code, use this manual entry key:');
    console.log(`\x1b[36m\x1b[1m${secret}\x1b[0m\n`); // Cyan, Bold

    console.log('──────────────────────────────────────────────────────────────');
    console.log('Action Required:');
    console.log('1. Scan the QR code or enter the key in your app.');
    console.log('2. Copy the manual entry key above.');
    console.log('3. Add it to your .env file and Vercel Environment Variables:');
    console.log(`\n   \x1b[32mTOTP_SECRET=${secret}\x1b[0m\n`);
    console.log('4. Restart your local server (npm run dev).');
    console.log('──────────────────────────────────────────────────────────────\n');
  });
}

main().catch(console.error);
