# Portfolio OS — Setup & Deployment Guide

A Windows 98-style interactive portfolio built with Next.js 14, Supabase, and Tailwind CSS.

---

## What You Get

- **BIOS boot screen** → Windows 98 loading → Full desktop OS
- **Draggable, resizable windows** for About, Projects, Skills, Contact
- **Easter eggs**: Snake, Minesweeper, fake VirusScan
- **Contact form** → saves to Supabase + Gmail notification + auto-reply
- **Resume download** from Supabase Storage
- **Project view counters**
- **Admin dashboard** at `/admin` to manage all content

---

## Step 1 — Clone & Install

```bash
git clone <your-repo-url>
cd portfolio
pnpm install
```

---

## Step 2 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **SQL Editor** → paste the entire contents of `supabase-schema.sql` → click **Run**
3. Go to **Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **Authentication → Users** → **Add User** → create your admin account
   - Use the email and password you'll log into `/admin` with

---

## Step 3 — Gmail Setup

You need a Gmail **App Password** (not your regular password):

1. Go to your Google Account → Security
2. Enable **2-Step Verification** if not already
3. Go to **App Passwords** (search for it)
4. Select "Mail" and generate a 16-character password
5. Copy it → use as `GMAIL_APP_PASSWORD`

---

## Step 4 — Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in all values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

ADMIN_EMAIL=your@gmail.com
ADMIN_PASSWORD=yourpassword

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Step 5 — Run Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll see the BIOS boot sequence!

Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Step 6 — Populate Your Content

Log in to the admin dashboard at `/admin/login` and:

1. **Profile** → Add your name, bio, tagline, links
2. **Skills** → Add your tech skills with proficiency levels
3. **Projects** → Add your projects with descriptions and links
4. **Resume** → Upload your PDF

---

## Step 7 — Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Change `NEXT_PUBLIC_SITE_URL` to your Vercel URL
5. Click **Deploy**

That's it! Your portfolio is live.

---

## Customization

### Change Desktop Wallpaper Color
In `components/os/Desktop.tsx`, change the `background` color of the desktop area (default is `#008080` — classic teal).

### Add More Desktop Icons
In `components/os/Desktop.tsx`, add to the `ICONS` array and create a new `Win95Window` in the JSX.

### Tweak Boot Sequence
- BIOS messages: `components/os/BiosScreen.tsx` → `BIOS_LINES` array
- Boot messages: `components/os/BootScreen.tsx` → `BOOT_MESSAGES` array

---

## File Structure

```
portfolio/
├── app/
│   ├── page.tsx                    ← Main portfolio (fetches from Supabase)
│   ├── layout.tsx
│   ├── globals.css
│   ├── admin/
│   │   ├── layout.tsx              ← Auth guard
│   │   ├── login/page.tsx
│   │   ├── page.tsx                ← Dashboard overview
│   │   ├── profile/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── skills/page.tsx
│   │   ├── contacts/page.tsx
│   │   └── resume/page.tsx
│   └── api/
│       ├── contact/route.ts        ← Form submit handler
│       └── projects/[id]/view/route.ts
├── components/
│   ├── os/                         ← All OS/portfolio components
│   └── admin/                      ← Admin UI components
├── lib/
│   ├── supabase.ts                 ← Browser client
│   ├── supabase.server.ts          ← Server client
│   └── mailer.ts                   ← Nodemailer
├── types/index.ts
├── supabase-schema.sql
└── .env.local.example
```
