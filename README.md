# Free Redirector — Simple Version

No Supabase. No database. GitHub + Vercel only.

## Create a redirect

Edit `redirects.json`:

```json
{
  "sih": "https://youtube.com/",
  "google": "https://google.com/"
}
```

This creates:

- `https://YOUR-DOMAIN/sih`
- `https://YOUR-DOMAIN/google`

## Change a destination

Change the value in `redirects.json`, commit and push:

```powershell
git add redirects.json
git commit -m "Update redirect"
git push
```

Vercel automatically deploys the change.

## Admin page

Open:

`https://YOUR-DOMAIN/admin/`

It lets you edit the JSON visually and download the updated file.

Important: this admin page is intentionally a local editor, not a database-backed admin API. Anyone who can open it can generate a redirect configuration file, so do not treat it as a private control panel.

## Vercel

Import the GitHub repo into Vercel. No environment variables are required.

For a custom domain, add it under Vercel → Project → Settings → Domains.
