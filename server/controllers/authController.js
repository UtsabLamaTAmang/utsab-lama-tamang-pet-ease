import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../utils/token.js";
import { cleanString } from "../utils/string.js";
import { sendOTP } from "../utils/emailService.js";

const prisma = new PrismaClient();

/**
 * REGISTER USER
 */
export const register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      if (existing.isVerified) {
        return res.status(400).json({ message: "Email already registered." });
      }

      // User exists but is not verified. 
      // Update the user details (optional) and send a new OTP.
      // We'll update the password and details to the new submission
      const hashed = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { email },
        data: {
          fullName: cleanString(fullName),
          phone: phone || null,
          passwordHash: hashed,
        }
      });

      // Proceed to generate and send OTP (logic continues below)
      // We just need to skip the 'create' part for new user
    } else {
      // Create new user if not existing
      const hashed = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          fullName: cleanString(fullName),
          email,
          phone: phone || null,
          passwordHash: hashed,
          role: "USER",
          isVerified: false,
        },
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    await prisma.oTP.create({
      data: {
        email,
        code: otpCode,
        expiresAt,
      },
    });

    // Send OTP Email
    await sendOTP(email, otpCode);

    return res.status(201).json({
      message: "Registration successful. Please verify your email with the OTP sent.",
      email: email,
    });
  } catch (err) {
    console.error("Register Error Details:", err);
    // Be more specific about the error if possible
    const message = err.message || "Server error";
    res.status(500).json({ message });
  }
};

/**
 * LOGIN USER
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Missing email or password" });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email address before logging in.",
        email: user.email,
        unverified: true
      });
    }

    const token = generateToken({ id: user.id, role: user.role });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * VERIFY TOKEN / GET ME
 */
export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(200).json({ user });
  } catch (err) {
    console.error("GetMe Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * UPDATE PROFILE
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: fullName ? cleanString(fullName) : undefined,
        phone: phone || undefined,
      },
    });

    return res.status(200).json({
      message: "Profile updated",
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
/**
 * VERIFY OTP
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required." });
    }

    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        code,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Mark user as verified
    const user = await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });

    // Delete used OTP
    await prisma.oTP.deleteMany({ where: { email } });

    const token = generateToken({ id: user.id, role: user.role });

    return res.status(200).json({
      message: "Email verified successfully.",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * RESEND OTP
 */
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified." });
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Update or Create OTP
    await prisma.oTP.create({
      data: {
        email,
        code: otpCode,
        expiresAt,
      },
    });

    // Send OTP Email
    await sendOTP(email, otpCode);

    return res.status(200).json({ message: "OTP resent successfully." });
  } catch (err) {
    console.error("Resend OTP Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
