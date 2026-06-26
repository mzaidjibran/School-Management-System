import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Sends a password reset OTP email to the given address.
// Throws on failure so the caller can handle the error.
export const sendOtpEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.verify();

  const mailOptions = {
    from: `"Inventory System" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; 
                  border: 1px solid #e0e0e0; border-radius: 8px; padding: 32px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="color: #555;">Apka OTP code neeche hai. Yeh <strong>10 minutes</strong> mein expire ho jaayega.</p>
        <div style="background: #f4f4f4; border-radius: 6px; padding: 20px; 
                    text-align: center; font-size: 36px; font-weight: bold; 
                    letter-spacing: 8px; color: #222; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 13px;">Agar aapne yeh request nahi ki toh is email ko ignore karen.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};