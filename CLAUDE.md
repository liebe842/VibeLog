# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VibeLog is a developer activity logging and social platform. Users track their coding/study/debug activities with streak tracking and GitHub-style activity heatmaps.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
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
- `projects.ts` - Project CRUD and management
- `auth.ts` - Login/logout with Google OAuth
- `profile.ts` - Profile updates, avatar upload, streak calculation
- `comments.ts` - Comment CRUD
- `notifications.ts` - Notification management
- `challenge.ts` - Challenge settings and progress
- `admin.ts` - User management, whitelist

**Action Pattern:**
- All actions use `"use server"` directive
- Auth via `supabase.auth.getUser()`
- Return `{ success: true }` or `{ error: string }`
- Call `revalidatePath()` for cache invalidation after mutations

### Supabase Clients
- `src/lib/supabase/server.ts` - Server-side client (uses cookies)
- `src/lib/supabase/client.ts` - Client-side browser client

### Key Data Models

**profiles**: User info with `stats` JSONB field:
```typescript
stats: {
  streak: number,              // Consecutive days with activity
  total_logs: number,          // Total posts created
  last_activity_date: string   // YYYY-MM-DD format
}
```

**posts**: Activity logs with `category` (Coding/Study/Debug), `duration_min`, optional `link_url`/`image_url`, `project_id` (FK), `likes`, `comments_count`

**projects**: Project organization with `title`, `description`, `status`, `color`, `icon`. Each user has a default "미분류" project for uncategorized posts.

**Streak Calculation Logic:**
- Same day: keep streak
- Next consecutive day: increment streak
- Gap > 1 day: reset to 1
- Dates normalized to midnight (0:0:0:0) for comparison

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

Tables: `profiles`, `posts`, `projects`, `likes`, `comments`, `notifications`, `whitelist`, `challenge_settings`

## Component Architecture

### Layout Structure
- Desktop: Fixed sidebar (`Sidebar`) + main content with left margin
- Mobile: Top header (`Header`) + bottom nav (`BottomNav`)
- Responsive breakpoints: `md:` (768px), `lg:` (1024px)

### Key Components
- `FeedList` - Main feed with optimistic updates for likes/deletes
- `WriteForm` - Post creation with category/duration/project selection
- `HeatmapGrid` - GitHub-style activity heatmap
- `ProjectPostList` - Project-specific posts filtered by project ID
- `CommentSection` - Nested comments with lazy loading

### Data Flow Pattern
1. Server Components fetch data via Server Actions
2. Client Components use `"use client"` + React hooks
3. Mutations call Server Actions → `revalidatePath()` → `router.refresh()`
4. Optimistic updates in UI before server confirmation

## Styling

- **Theme**: GitHub-dark inspired (`#0d1117` bg, `#161b22` surface, `#2ea043` accent)
- **Category Colors**: Coding (blue), Study (purple), Debug (orange)
- **Icons**: Google Material Symbols Outlined (CDN)
- **Utilities**: `clsx` + `tailwind-merge` for conditional styling
- **Project Colors**: Managed via `src/lib/project-colors.ts` mapping to Tailwind classes

## Language & Localization

- UI contains Korean strings (카테고리, 로그인, etc.)
- Date formatting uses `toLocaleDateString("ko-KR")`
- Relative time: "방금 전" (just now), "X분 전" (X minutes ago)
