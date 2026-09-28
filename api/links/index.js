import { db, json } from "../_db.js";
import { isAuthed } from "../_auth.js";

export default async function handler(req, res) {
  if (!isAuthed(req)) return json(res, 401, { error: "Unauthorized" });

  const supabase = db();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, data);
  }

  if (req.method === "POST") {
    const slug = String(req.body?.slug || "")
      .trim()
      .toLowerCase()
      .replace(/^\/+/, "");

    const destination = String(req.body?.destination || "").trim();

    if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(slug)) {
      return json(res, 400, {
        error: "Slug must use letters, numbers, hyphens or underscores."
      });
    }

    let url;
    try {
      url = new URL(destination);
    } catch {
      return json(res, 400, { error: "Enter a valid destination URL." });
    }

    if (!["http:", "https:"].includes(url.protocol)) {
      return json(res, 400, { error: "Destination must use http or https." });
    }

    const { data, error } = await supabase
      .from("links")
      .insert({
        slug,
        destination: url.toString(),
        enabled: true
      })
      .select()
      .single();

    if (error) {
      const duplicate = error.code === "23505";
      return json(res, duplicate ? 409 : 500, {
        error: duplicate ? "That slug already exists." : error.message
      });
    }

    return json(res, 201, data);
  }

  return json(res, 405, { error: "Method not allowed" });
}
