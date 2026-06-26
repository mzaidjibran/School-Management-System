import jwt from "jsonwebtoken";

// Generates a short-lived JWT access token (24h) containing userId, role, and email.
// Used at login and token refresh.
export const generateAccessToken = (userId, userRole, email) => {
  return jwt.sign(
    { userId, role: userRole, email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "24h" },
  );
};

// Generates a long-lived JWT refresh token (7d) containing only the userId.
// Used to issue new access tokens without re-login.
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );
};