# Link Redirector — Vercel + Supabase

A small self-hosted link manager.

## Features

- Admin login
- Create custom slugs such as `/yt` or `/sih`
- Edit destinations instantly
- Enable/disable links
- Delete links
- Copy redirect URLs
- Redirects are handled server-side
- Works with a custom domain on Vercel

## 1. Create the database

Create a free Supabase project.

Open **SQL Editor** and run `supabase/schema.sql`.

## 2. Deploy

Push this folder to GitHub and import the repository into Vercel.

Set these environment variables in Vercel:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `PUBLIC_BASE_URL`

`PUBLIC_BASE_URL` should be your real public URL, for example:
`https://go.example.com`

Do NOT expose `SUPABASE_SERVICE_ROLE_KEY` in browser code.

## 3. Admin

Open:

`https://your-domain.com/`

Login using the value configured as `ADMIN_PASSWORD`.

## 4. Custom domain

In Vercel:
Project → Settings → Domains

Point your domain/subdomain to Vercel.

Example:

`go.example.com/sih`

can redirect to any destination you choose.

## Security

This is intended for a small personal/team redirect service.

For stronger production security, replace the single admin password with Supabase Auth or another identity provider.
