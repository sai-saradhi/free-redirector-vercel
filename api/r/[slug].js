import { db } from "../_db.js";

export default async function handler(req, res) {
  const slug = String(req.query.slug || "").toLowerCase();
  const supabase = db();

  const { data, error } = await supabase
    .from("links")
    .select("id,destination,enabled")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return res.status(500).send("Redirect service error.");
  }

  if (!data || !data.enabled) {
    return res.status(404).send("Link not found.");
  }

  // Fire-and-forget click counter update.
  supabase
    .from("links")
    .update({ clicks: (data.clicks || 0) + 1, updated_at: new Date().toISOString() })
    .eq("id", data.id)
    .then(() => {});

  res.setHeader("Cache-Control", "no-store");
  return res.redirect(302, data.destination);
}
