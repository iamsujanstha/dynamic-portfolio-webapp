import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending emails using Nodemailer
  app.post('/api/send-email', async (req, res) => {
    const { name, email, message } = req.body;
    
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const contactEmail = process.env.CONTACT_EMAIL || 'sujan.sjv08@gmail.com';
    
    if (!smtpUser || !smtpPass) {
      console.error('SMTP credentials are not set');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    try {
      // Send mail with defined transport object
      const info = await transporter.sendMail({
        from: `"${name}" <${smtpUser}>`,
        to: contactEmail,
        subject: `[Portfolio Contact] Message from ${name}`, // More descriptive subject
        replyTo: email,
        text: `You have a new message from your portfolio.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="background-color: #000; color: #fff; padding: 24px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px; letter-spacing: 1px; text-transform: uppercase;">New Contact Message</h2>
            </div>
            <div style="padding: 32px; background-color: #ffffff;">
              <div style="margin-bottom: 24px;">
                <p style="margin: 0; color: #888; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">From</p>
                <p style="margin: 4px 0 0; color: #333; font-size: 16px;"><strong>${name}</strong> (${email})</p>
              </div>
              <div style="margin-bottom: 24px; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border-left: 4px solid #000;">
                <p style="margin: 0; color: #888; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Message</p>
                <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
            <div style="background-color: #f4f4f4; padding: 16px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #888; font-size: 11px;">Sent from your Portfolio Website</p>
            </div>
          </div>
        `,
      });

      console.log('Message sent: %s', info.messageId);
      res.status(200).json({ success: true, messageId: info.messageId });
    } catch (err) {
      console.error('Nodemailer Error:', err);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
