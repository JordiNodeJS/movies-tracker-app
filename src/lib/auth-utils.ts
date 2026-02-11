import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const JWT_SECRET_RAW =
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production";

if (
  process.env.NODE_ENV === "production" &&
  JWT_SECRET_RAW === "your-super-secret-key-change-in-production"
) {
  console.error(
    "❌ CRITICAL: JWT_SECRET is using the default development value in production! " +
      "Please set a secure random JWT_SECRET in your environment variables.",
  );
  throw new Error("Insecure JWT_SECRET in production");
}

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_RAW);
const JWT_ALGORITHM = "HS256";
const TOKEN_EXPIRY = "7d";

export interface UserJWTPayload extends JWTPayload {
  userId: string;
  email: string;
}

/**
 * Hash a password using scrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${derivedKey.toString("hex")}.${salt}`);
    });
  });
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [hash, salt] = storedHash.split(".");
    if (!hash || !salt) {
      resolve(false);
      return;
    }

    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      const hashBuffer = Buffer.from(hash, "hex");
      resolve(timingSafeEqual(hashBuffer, derivedKey));
    });
  });
}

/**
 * Sign a JWT token
 */
export async function signJWT(payload: {
  userId: string;
  email: string;
}): Promise<string> {
  const token = await new SignJWT({
    userId: payload.userId,
    email: payload.email,
  })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyJWT(token: string): Promise<UserJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    });
    return payload as UserJWTPayload;
  } catch {
    return null;
  }
}
