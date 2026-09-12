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
