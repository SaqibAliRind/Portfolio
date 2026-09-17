import nodemailer from 'nodemailer';

/**
 * Email Service — Gmail SMTP via Nodemailer
 * Uses App Password stored in .env (never the real Gmail password)
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

/**
 * Send OTP email to the admin
 * @param {string} toEmail - Admin's email address
 * @param {string} otp - 6-digit OTP code
 */
export const sendOTPEmail = async (toEmail, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Portfolio Admin" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: '🔐 Your Admin Login OTP',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login OTP</title>
      </head>
      <body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#111118;border-radius:16px;border:1px solid #1e1e2e;overflow:hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#5a4fcf 0%,#7c6eff 100%);padding:32px;text-align:center;">
                    <div style="font-size:36px;margin-bottom:8px;">🔐</div>
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">Admin Verification</h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Portfolio Admin Panel</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px 36px;">
                    <p style="color:#a0a0b8;font-size:15px;line-height:1.6;margin:0 0 24px;">
                      A login attempt was made to your admin panel. Use the OTP below to complete your sign-in.
                    </p>

                    <!-- OTP Box -->
                    <div style="background:#0a0a0f;border:1px solid #2d2d4e;border-radius:12px;padding:28px;text-align:center;margin:0 0 28px;">
                      <p style="color:#6b6b8a;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Your One-Time Password</p>
                      <div style="font-size:44px;font-weight:800;letter-spacing:12px;color:#7c6eff;font-family:'Courier New',monospace;">${otp}</div>
                    </div>

                    <!-- Timer warning -->
                    <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:14px 16px;margin:0 0 28px;">
                      <p style="color:#f87171;font-size:13px;margin:0;text-align:center;">
                        ⏰ &nbsp;This OTP expires in <strong>5 minutes</strong>. Do not share it with anyone.
                      </p>
                    </div>

                    <p style="color:#6b6b8a;font-size:13px;line-height:1.6;margin:0;">
                      If you did not attempt to login, please ignore this email. Your account remains secure.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="border-top:1px solid #1e1e2e;padding:20px 36px;text-align:center;">
                    <p style="color:#4a4a6a;font-size:12px;margin:0;">
                      © ${new Date().getFullYear()} Saqib Ali Rind — Portfolio Admin Panel
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send notification email to admin when a new contact message is submitted
 * @param {Object} messageData - The message details
 */
export const sendContactNotificationEmail = async (messageData) => {
  const transporter = createTransporter();
  const { name, email, subject, message, projectType } = messageData;
  const adminEmail = process.env.GMAIL_USER; // Send to self

  const mailOptions = {
    from: `"Portfolio Contact Form" <${process.env.GMAIL_USER}>`,
    to: adminEmail,
    replyTo: email,
    subject: `New Message: ${subject}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 24px; color: white; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
          .content { padding: 32px; color: #3f3f46; }
          .field { margin-bottom: 20px; }
          .label { font-size: 12px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
          .value { font-size: 15px; color: #27272a; background: #f4f4f5; padding: 12px 16px; border-radius: 8px; border: 1px solid #e4e4e7; }
          .message-box { font-size: 15px; color: #27272a; background: #f4f4f5; padding: 16px; border-radius: 8px; border: 1px solid #e4e4e7; white-space: pre-wrap; line-height: 1.6; }
          .footer { text-align: center; padding: 20px; color: #a1a1aa; font-size: 12px; border-top: 1px solid #f4f4f5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📬 New Contact Message Received</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Sender Name</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">Email Address</div>
              <div class="value"><a href="mailto:${email}" style="color: #ea580c; text-decoration: none;">${email}</a></div>
            </div>
            <div class="field">
              <div class="label">Subject</div>
              <div class="value">${subject}</div>
            </div>
            ${projectType ? `
            <div class="field">
              <div class="label">Project Type</div>
              <div class="value">${projectType}</div>
            </div>
            ` : ''}
            <div class="field">
              <div class="label">Message</div>
              <div class="message-box">${message}</div>
            </div>
          </div>
          <div class="footer">
            You can reply directly to this email to reach ${name}.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
