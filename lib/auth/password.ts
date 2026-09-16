import "server-only";
import bcrypt from "bcryptjs";

// Recommended cost factor for modern systems
const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password securely using bcrypt.
 * Never logs or exposes the plaintext password.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string.");
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plaintext candidate password against a stored bcrypt hash.
 * Timing-safe comparison handled internally by bcrypt.
 */
export async function verifyPassword(
  candidate: string,
  hash: string
): Promise<boolean> {
  if (!candidate || !hash) {
    return false;
  }
  return bcrypt.compare(candidate, hash);
}
