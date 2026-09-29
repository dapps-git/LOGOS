const nodemailer = require('nodemailer');

/**
 * Send Email via Nodemailer with LOGOS Books branding
 * @param {Object} options - { email, subject, text, html, otp, type }
 */
const sendEmail = async (options) => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const from = process.env.SMTP_FROM || `"LOGOS Books" <${user || 'noreply@logosbooks.in'}>`;

  // Default HTML template if OTP is provided
  let htmlContent = options.html;
  if (options.otp && !htmlContent) {
    htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <div style="background: linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 2px; margin: 0 0 6px; text-transform: uppercase;">LOGOS</h1>
          <p style="color: #94A3B8; font-size: 12px; margin: 0; letter-spacing: 0.5px;">Premium Books & Literary Excellence</p>
        </div>
        
        <div style="padding: 32px 28px;">
          <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 0 0 12px;">Password Reset Verification</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            We received a request to reset your password for your LOGOS Books account. Use the one-time verification code (OTP) below to complete your password reset:
          </p>
          
          <div style="background: #F8FAFC; border: 2px dashed #CBD5E1; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1E3A8A; font-family: monospace;">${options.otp}</span>
          </div>
          
          <p style="color: #64748B; font-size: 12px; line-height: 1.5; margin: 0 0 16px;">
            ⏱️ This verification code is valid for <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email or contact support if you suspect unauthorized access.
          </p>
          
          <hr style="border: none; border-top: 1px solid #F1F5F9; margin: 24px 0;" />
          
          <p style="color: #94A3B8; font-size: 11px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} LOGOS Books. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }

  // If credentials exist, send real email via transporter
  if (user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass
        }
      });

      const message = {
        from,
        to: options.email,
        subject: options.subject || 'LOGOS Books - Password Reset OTP',
        text: options.text || `Your LOGOS Books password reset OTP is ${options.otp}. Valid for 15 minutes.`,
        html: htmlContent
      };

      const info = await transporter.sendMail(message);
      console.log(`[Nodemailer] Email sent successfully to ${options.email}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('[Nodemailer Error]', err.message);
      // Fallback in dev/error so user flow is not broken
      return { success: false, error: err.message, otp: options.otp };
    }
  } else {
    // Development fallback when SMTP_USER is not yet set in .env
    console.log(`\n========================================`);
    console.log(`[Nodemailer DEV] To: ${options.email}`);
    console.log(`[Nodemailer DEV] Subject: ${options.subject || 'Password Reset OTP'}`);
    console.log(`[Nodemailer DEV] OTP: ${options.otp}`);
    console.log(`========================================\n`);
    return { success: true, isDevFallback: true, otp: options.otp };
  }
};

module.exports = sendEmail;
