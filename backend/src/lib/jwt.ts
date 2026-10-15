import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

if (!secret || secret.length < 32) {
  throw new Error("JWT_SECRET must be set and at least 32 characters long.");
}

const jwtSecret = secret;

export function signToken(userId: string, remember = false): string {
  return jwt.sign({ sub: userId }, jwtSecret, { expiresIn: remember ? "30d" : "1d" });
}

export function verifyToken(token: string): { sub: string } {
  const payload = jwt.verify(token, jwtSecret);
  if (typeof payload === "string" || typeof payload.sub !== "string") {
    throw new Error("Invalid token payload");
  }
  return { sub: payload.sub };
}
