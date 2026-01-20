# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VibeLog is a developer activity logging and social platform. Users track their coding/study/debug activities with streak tracking and GitHub-style activity heatmaps.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Animation**: Framer Motion

## Architecture

### Authentication Flow
1. Google OAuth via Supabase Auth
2. Whitelist-based registration (email must be pre-approved in `whitelist` table)
3. Auto profile creation via database trigger on `auth.users` insert
4. Middleware (`src/proxy.ts`) handles route protection and admin access

### Server Actions Pattern
All API logic uses Next.js Server Actions in `src/lib/actions/`:
- `posts.ts` - CRUD for activity posts, likes
- `auth.ts` - Login/logout with Google OAuth
- `profile.ts` - Profile updates, avatar upload, streak calculation
- `comments.ts` - Comment CRUD
- `notifications.ts` - Notification management
- `challenge.ts` - Challenge settings and progress
- `admin.ts` - User management, whitelist

### Supabase Clients
- `src/lib/supabase/server.ts` - Server-side client (uses cookies)
- `src/lib/supabase/client.ts` - Client-side browser client

### Key Data Models

**profiles**: User info with `stats` JSONB field containing `{streak, total_logs, last_activity_date}`

**posts**: Activity logs with category (Coding/Study/Debug), duration, optional link/image

**Row Level Security**: All tables have RLS enabled. Users can only modify their own data.

### Middleware
`src/proxy.ts` exports a `proxy` function (not default `middleware`) for Next.js 15+ compatibility:
- Public routes: `/login`, `/auth/callback`
- Admin routes: `/admin/*` requires `role: 'admin'` in profiles

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_BASE_URL=<app-base-url>
```

## Database Schema

SQL migration files are in project root (`*.sql`). Main schema in `supabase_schema.sql`.

Tables: `profiles`, `posts`, `likes`, `comments`, `notifications`, `whitelist`, `challenge_settings`
