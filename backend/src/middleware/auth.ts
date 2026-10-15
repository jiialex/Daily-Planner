import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt";

export type AuthRequest = Request & { userId?: string };

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    const token = header.slice("Bearer ".length);
    req.userId = verifyToken(token).sub;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
