import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import { signDeviceId, verifyDeviceId } from "../lib/auth";

declare global {
  namespace Express {
    interface Request {
      deviceId: string;
    }
  }
}

const COOKIE = "did";
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export function requireDevice(req: Request, res: Response, next: NextFunction): void {
  const raw = req.cookies?.[COOKIE] as string | undefined;
  if (raw) {
    const id = verifyDeviceId(raw);
    if (id) {
      req.deviceId = id;
      next();
      return;
    }
  }

  const deviceId = crypto.randomUUID();
  res.cookie(COOKIE, signDeviceId(deviceId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_MS,
  });
  req.deviceId = deviceId;
  next();
}
