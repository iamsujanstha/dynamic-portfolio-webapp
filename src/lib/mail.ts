import nodemailer from 'nodemailer';

export async function sendVerificationEmail(email: string, code: string) {
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #000; color: #fff; padding: 24px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px; letter-spacing: 1px; text-transform: uppercase;">Portfolio Login Verification</h2>
      </div>
      <div style="padding: 32px; background-color: #ffffff; text-align: center;">
        <p style="margin: 0 0 24px; color: #666; font-size: 16px;">Please use the verification code below to access the Admin Gateway:</p>
        <div style="display: inline-block; padding: 16px 32px; background-color: #f4f4f5; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #000; border: 1px solid #e4e4e7; margin-bottom: 24px;">
          ${code}
        </div>
        <p style="margin: 0; color: #999; font-size: 12px;">This code was requested for admin credentials sign-in and is valid for 10 minutes.</p>
      </div>
      <div style="background-color: #f4f4f4; padding: 16px; text-align: center; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0; color: #888; font-size: 11px;">Sent from your Portfolio Admin Dashboard</p>
      </div>
    </div>
  `;

  // 1. Resend HTTP API (Recommended for Vercel production to bypass SMTP block)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    console.log('Sending email via Resend HTTP API...');
    const sender = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Portfolio Admin <${sender}>`,
        to: email,
        subject: 'Your Admin Verification Code',
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Resend API failed: ${JSON.stringify(err)}`);
    }

    const info = await res.json();
    console.log(`Verification email sent via Resend: ${info.id} to ${email}`);
    return info;
  }

  // 2. Fallback to standard SMTP / Nodemailer
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.error('SMTP credentials are not configured in environment variables');
    throw new Error('Email service not configured');
  }

  const isGmail = smtpHost && smtpHost.includes('gmail');
  const transporter = nodemailer.createTransport(
    isGmail
      ? {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS on port 587
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      }
      : {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      }
  );

  const info = await transporter.sendMail({
    from: `"Portfolio System Admin" <${smtpUser}>`,
    to: email,
    subject: 'Your Admin Verification Code',
    text: `Your admin login verification code is: ${code}\n\nThis code is valid for 10 minutes.`,
    html: htmlContent,
  });

  console.log(`Verification email sent via SMTP: ${info.messageId} to ${email}`);
  return info;
}
