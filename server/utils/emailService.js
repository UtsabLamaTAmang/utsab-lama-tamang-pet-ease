import nodemailer from "nodemailer";

// Using etheral for testing or a dummy logger if no credentials
// The user hasn't provided credentials, so I'll implement a flexible transporter
// that logs to console if environment variables are missing.

const createTransporter = () => {
  let host = process.env.SMTP_HOST;
  // If user mistakenly put their email as host, fix it for them
  if (host && host.includes("@")) {
    host = "smtp.gmail.com";
  }

  if (host && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: host,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to console logger for development
  return {
    sendMail: async (options) => {
      console.log("-----------------------------------------");
      console.log("EMAIL SERVICE (DEVELOPMENT MODE)");
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body: ${options.text}`);
      console.log("-----------------------------------------");
      return { messageId: "dev-mode-otp" };
    },
  };
};

const transporter = createTransporter();

export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"PetEase" <${process.env.SMTP_USER || "noreply@petease.com"}>`,
    to: email,
    subject: "Your Signup Verification Code",
    text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">Welcome to PetEase!</h2>
        <p>Thank you for signing up. Please use the following code to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; background: #f4f4f4; padding: 10px 20px; border-radius: 5px;">${otp}</span>
        </div>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777; text-align: center;">&copy; 2025 PetEase. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send verification email");
  }
};

/**
 * Send a generic email
 * @param {Object} options - Email options { to, subject, html, text }
 */
export const sendEmail = async (options) => {
  const mailOptions = {
    from: `"PetEase" <${process.env.SMTP_USER || "noreply@petease.com"}>`,
    to: options.to,
    subject: options.subject,
    text: options.text || "",
    html: options.html || options.text || "",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send email");
  }
};
