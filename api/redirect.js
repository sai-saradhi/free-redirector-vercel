import fs from "node:fs";
import path from "node:path";

export default function handler(req, res) {
  const slug = String(req.query.slug || "").replace(/^\/+/, "").toLowerCase();
  const file = path.join(process.cwd(), "redirects.json");

  let redirects = {};
  try {
    redirects = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return res.status(500).send("Redirect configuration error.");
  }

  const destination = redirects[slug];

  if (!destination) {
    return res.status(404).send("Link not found.");
  }

  try {
    const url = new URL(destination);
    if (!["http:", "https:"].includes(url.protocol)) {
      return res.status(500).send("Invalid redirect destination.");
    }
    res.setHeader("Cache-Control", "no-store");
    return res.redirect(302, url.toString());
  } catch {
    return res.status(500).send("Invalid redirect destination.");
  }
}