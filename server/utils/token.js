import jwt from "jsonwebtoken";

// Generate Token
export const generateToken = (payload, expiresIn = "7d") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Verify Token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// Decode Token
export const decodeToken = (token) => {
  return jwt.decode(token, { complete: true });
};

// Extract Token From Header
export const getTokenFromHeader = (req) => {
  const bearer = req.headers.authorization;
  if (bearer && bearer.startsWith("Bearer ")) {
    return bearer.split(" ")[1];
  }
  return req.headers.token || null;
};

// Check Token Expired
export const isTokenExpired = (token) => {
  const decoded = jwt.decode(token);
  if (!decoded || !decoded.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
};

// Generate Refresh Token
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
};

// Verify Refresh Token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return null;
  }
};

// Blacklist Token (logout)
const blacklist = new Set();

export const blacklistToken = (token) => {
  blacklist.add(token);
};

export const isBlacklisted = (token) => {
  return blacklist.has(token);
};

// Set Token as Cookie
export const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// Role Check
export const hasRole = (user, allowedRoles = []) => {
  return allowedRoles.includes(user.role);
};

