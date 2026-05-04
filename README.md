# Novel Tracker

A personal web novel reading tracker. Replaces a spreadsheet with a proper UI for managing reading progress, tags, and notes.

## Features

- Add, edit, and delete novels with chapter, last read date, origin, and notes
- Status tags: Finished Reading, Dropped, Translation Finished, Translation Dropped
- Filter by origin, status, liked, or search by name — with one-click clear
- Sortable columns (name, chapter, last read)
- Duplicate detection on add — redirects to edit if the novel already exists
- Light / dark mode
- Reading stats dashboard at `/stats`

## Stack

- [Next.js](https://nextjs.org) (App Router)
- [Supabase](https://supabase.com) (PostgreSQL)
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)

## Setup

1. Create a Supabase project and run the migrations in `supabase/migrations/` in order
2. Copy your Supabase keys into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

3. Install and run:

```bash
npm install
npm run dev
```

Without Supabase configured, the app runs against an in-memory mock store for local testing.

## Running in Production

```bash
npm run build
pm2 start npm --name "novel-tracker" -- start
```
