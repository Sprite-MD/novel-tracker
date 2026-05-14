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
- [SQLite](https://www.sqlite.org) via `better-sqlite3` (local file at `data/novels.db`)
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)

## Setup

No external services required. Install and run:

```bash
npm install
npm run dev
```

The database file is created automatically at `data/novels.db` on first run.

## Running in Production

```bash
npm run build
pm2 start npm --name "novel-tracker" -- start
```
