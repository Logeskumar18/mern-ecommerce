import jwt from "jsonwebtoken";

/**
 * Generate a JWT token
 * @param {Object} payload - Data to include (e.g., userId, role)
 * @returns {String} JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d", // Default: 7 days
  });
};

/**
 * Verify a JWT token
 * @param {String} token - The token string
 * @returns {Object|Boolean} Decoded payload or false if invalid
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return false;
  }
};
