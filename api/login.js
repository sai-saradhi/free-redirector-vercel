import { cookieOptions, isAuthed } from "./_auth.js";

export default function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ authenticated: isAuthed(req) });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const password = String(req.body?.password || "");
  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected || password !== expected) {
    return res.status(401).json({ error: "Invalid password" });
  }

  res.setHeader("Set-Cookie", cookieOptions());
  return res.status(200).json({ authenticated: true });
}
