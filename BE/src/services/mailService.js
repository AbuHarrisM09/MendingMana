const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

// Inisialisasi transporter hanya jika SMTP dikonfigurasi
if (env.smtp.host && env.smtp.user && env.smtp.pass) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });

  // Verifikasi koneksi SMTP saat startup
  transporter.verify()
    .then(() => console.log('SMTP mail transporter ready.'))
    .catch((err) => console.warn('SMTP connection warning:', err.message));
} else {
  console.warn('SMTP is not configured. OTP codes will be printed to console.');
}

/**
 * Mengirim email OTP untuk reset password.
 * Jika SMTP tidak dikonfigurasi, OTP dicetak ke console untuk development.
 */
async function sendOtpEmail(toEmail, otp) {
  if (!transporter) {
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log(`  [OTP FORGOT PASSWORD]`);
    console.log(`  Email : ${toEmail}`);
    console.log(`  OTP   : ${otp}`);
    console.log(`  Berlaku 5 menit.`);
    console.log('═══════════════════════════════════════════════');
    console.log('');
    return { success: true, method: 'console' };
  }

  const mailOptions = {
    from: env.smtp.from || `"MendingMana" <${env.smtp.user}>`,
    to: toEmail,
    subject: 'Kode OTP Reset Password — MendingMana',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #1e293b; margin: 0;">MendingMana</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Platform Review & Rating Gadget</p>
        </div>
        <div style="background: white; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <p style="color: #334155; font-size: 14px; margin-top: 0;">Halo,</p>
          <p style="color: #334155; font-size: 14px;">Kami menerima permintaan untuk mereset password akun Anda. Gunakan kode OTP berikut:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; background: #eff6ff; padding: 16px 32px; border-radius: 12px; border: 2px dashed #93c5fd;">
              ${otp}
            </span>
          </div>
          <p style="color: #64748b; font-size: 13px; text-align: center;">Kode ini berlaku selama <strong>5 menit</strong>.</p>
          <p style="color: #64748b; font-size: 13px;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 16px;">
          &copy; ${new Date().getFullYear()} MendingMana. Semua hak dilindungi.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  return { success: true, method: 'email' };
}

module.exports = {
  sendOtpEmail,
};
