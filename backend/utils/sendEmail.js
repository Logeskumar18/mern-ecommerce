import nodemailer from "nodemailer";

// ✅ Create transporter once and reuse
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // use App Password, not real Gmail password
  },
});

/**
 * Send Email Utility
 * @param {string} to - Receiver email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text message
 * @param {string} html - Optional HTML message
 */
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: `"ShopSphere" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      ...(html && { html }), // include html if provided
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${to} | Message ID: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
};

export default sendEmail;
