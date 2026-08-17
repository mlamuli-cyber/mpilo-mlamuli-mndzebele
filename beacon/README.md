# Beacon

A focused daily task and project tracker — built as a real tool for daily use, not just a demo.

**Live demo:** _(added once deployed)_

## Stack

- **Frontend:** React 19 + Vite, React Router
- **Backend:** Supabase (Postgres + Auth), accessed directly from the client via `@supabase/supabase-js`
- **Security:** Row Level Security on every table — each account can only ever read or write its own rows, enforced at the database layer, not just in the UI
- **Hosting:** static frontend on Netlify; Supabase hosts the database and auth

No custom backend server to run or maintain — the whole thing is a static site talking directly to Supabase.

## Features

- **Today** — everything due today plus anything overdue, with a live progress strip and a collapsible "completed today" section
- **Upcoming** — future tasks grouped by day
- **Inbox** — tasks captured without a due date yet
- **All Tasks** — full searchable, filterable list
- **Projects** — color-coded, each with its own task list
- **Quick add** — type naturally: `Renew passport tomorrow !high` or `Call the bank fri` — dates and priority are parsed automatically, no AI API needed
- **Light / dark theme**, persisted per device
- Fully responsive — the nav collapses to a drawer on mobile

## Local setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is enough)

3. **Run the schema** — open the SQL Editor in your Supabase project, paste the contents of `supabase/schema.sql`, and run it. This creates the `projects` and `tasks` tables with Row Level Security policies already attached.

4. **Set your environment variables** — copy `.env.example` to `.env.local` and fill in your project's URL and anon public key (Project Settings → API):
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
   The anon key is safe to expose client-side — it has no special privileges on its own; access control comes entirely from the RLS policies in `schema.sql`.

5. **Run it**
   ```bash
   npm run dev
   ```

## Deploying (Netlify)

1. Push this repo to GitHub (or connect Netlify directly to your fork)
2. In Netlify: **Add new site → Import an existing project**, pick this repo
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add the same two environment variables from `.env.local` under **Site settings → Environment variables**
5. Deploy — the `public/_redirects` file is already set up so client-side routes (like `/today`) work correctly on refresh and direct links

## Project structure

```
src/
  components/     Reusable UI: NavRail, TopBar, TaskRow, modals, icons
  context/        AuthContext (Supabase auth) and DataContext (tasks/projects CRUD)
  lib/            supabase client, formatting helpers, quick-add parser, theme hook
  pages/          Today, Upcoming, Inbox, AllTasks, ProjectView, Auth
  styles/         Design tokens, base reset, layout, components, auth screen
supabase/
  schema.sql      Tables, indexes, and RLS policies — run once per Supabase project
```

## Design notes

The visual language is deliberately not a generic SaaS template: a "dispatch log" concept where task priority is shown as a colored signal bar on the left edge of every row (red/amber/blue/violet), the same color system used for the daily progress strip. The left nav rail stays in a fixed dark "console" styling regardless of the light/dark theme toggle, like the bezel around an instrument panel.
