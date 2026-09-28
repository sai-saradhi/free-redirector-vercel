import crypto from "node:crypto";

function secret() {
  return process.env.ADMIN_PASSWORD || "change-me";
}

export function makeToken() {
  const payload = `${Date.now()}`;
  const sig = crypto
    .createHmac("sha256", secret())
    .update(payload)
    .digest("hex");
  return `${payload}.${sig}`;
}

export function validToken(token) {
  if (!token) return false;

  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const age = Date.now() - Number(payload);
  if (!Number.isFinite(age) || age < 0 || age > 7 * 24 * 60 * 60 * 1000) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret())
    .update(payload)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(sig),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

export function cookieOptions(maxAge = 7 * 24 * 60 * 60) {
  return `redirect_admin=${encodeURIComponent(makeToken())}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function isAuthed(req) {
  const raw = req.headers.cookie || "";
  const match = raw.match(/(?:^|;\s*)redirect_admin=([^;]+)/);
  return validToken(match ? decodeURIComponent(match[1]) : "");
}
