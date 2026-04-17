import crypto from "node:crypto";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

export function signDeviceId(deviceId: string): string {
  const sig = crypto.createHmac("sha256", secret()).update(deviceId).digest("hex");
  return `${deviceId}.${sig}`;
}

export function verifyDeviceId(signed: string): string | null {
  const dot = signed.lastIndexOf(".");
  if (dot === -1) return null;
  const deviceId = signed.slice(0, dot);
  const sig = signed.slice(dot + 1);
  const expected = crypto.createHmac("sha256", secret()).update(deviceId).digest("hex");
  const sigBuf = Buffer.from(sig, "hex");
  const expBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expBuf.length) return null;
  return crypto.timingSafeEqual(sigBuf, expBuf) ? deviceId : null;
}
