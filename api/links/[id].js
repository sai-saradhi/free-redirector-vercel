import { db, json } from "../_db.js";
import { isAuthed } from "../_auth.js";

export default async function handler(req, res) {
  if (!isAuthed(req)) return json(res, 401, { error: "Unauthorized" });

  const id = req.query.id;
  const supabase = db();

  if (req.method === "PATCH") {
    const patch = {};

    if (req.body?.destination !== undefined) {
      const destination = String(req.body.destination).trim();
      let url;
      try {
        url = new URL(destination);
      } catch {
        return json(res, 400, { error: "Enter a valid destination URL." });
      }

      if (!["http:", "https:"].includes(url.protocol)) {
        return json(res, 400, { error: "Destination must use http or https." });
      }

      patch.destination = url.toString();
    }

    if (req.body?.enabled !== undefined) {
      patch.enabled = Boolean(req.body.enabled);
    }

    if (!Object.keys(patch).length) {
      return json(res, 400, { error: "Nothing to update." });
    }

    patch.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("links")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, data);
  }

  if (req.method === "DELETE") {
    const { error } = await supabase
      .from("links")
      .delete()
      .eq("id", id);

    if (error) return json(res, 500, { error: error.message });
    return json(res, 200, { ok: true });
  }

  return json(res, 405, { error: "Method not allowed" });
}
