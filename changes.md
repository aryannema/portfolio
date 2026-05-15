# Portfolio OS — Dev Log

## 2026-05-16 — Session 7

### Security Hardening

- **`middleware.ts`** (new at root) — Supabase session refresh on every request keeps auth tokens alive; also protects all `/admin/*` routes at the edge (belt-and-suspenders on top of `(protected)/layout.tsx`)
- **Security headers** added to `next.config.mjs`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geolocation disabled), `X-XSS-Protection`, and a Content-Security-Policy that whitelists only Supabase domains, Google Fonts, and `self`
- **Google OAuth** on admin login (`/admin/login`) — "Continue with Google" button using `supabase.auth.signInWithOAuth`. Requires Google provider enabled in Supabase dashboard (see setup note below)
- **OAuth callback route** — `app/admin/auth/callback/route.ts` exchanges the `?code=` param for a session cookie and redirects to `/admin`
- **Rate limiting** on `/api/contact` — 5 submissions per IP per 60-second window; returns 429 with user-friendly message
- **Input sanitization** on `/api/contact` — strips `<>` from all string fields, enforces length caps (name 100, email 254, message 5000 chars)
- **Next.js upgraded** from 15.3.3 → 16.2.6 to patch CVE-2025-66478

### SEO

- **Dynamic `generateMetadata`** in `app/page.tsx` — title, description, Open Graph, and Twitter Card all pulled from the live Supabase profile row; `metadataBase` set from `NEXT_PUBLIC_SITE_URL` env var
- **JSON-LD Person schema** injected in `<head>` on the home page; values from profile (name, bio, email, location, GitHub, LinkedIn); `</script>` injection prevented with Unicode escaping
- **`app/robots.ts`** — generates `/robots.txt` disallowing `/admin/` and `/api/`; links to sitemap
- **`app/sitemap.ts`** — generates `/sitemap.xml` with the home page URL

### Resume Skill Extraction (AI-free)

- Installed **`pdf-parse`** (+ `@types/pdf-parse`); registered in `serverExternalPackages` to stay out of webpack
- **`app/api/admin/extract-skills/route.ts`** (new) — downloads `resume.pdf` from Supabase storage, parses text with pdf-parse, then word-boundary matches against a 140+ entry skill dictionary covering Frontend / Backend / Database / DevOps / Mobile / Other
- **Resume admin page** fully rewritten with a two-stage UI:
  1. Upload (existing) → on success shows **"🔍 Extract Skills from Resume"** button
  2. Skill panel shows every detected skill with a checkbox (default ✅), a category badge, and a proficiency slider (default 80%). "Select all / Deselect all" shortcuts. **"Import N Skills"** button inserts selected rows into the `skills` table in one batch

#### Google OAuth setup (manual step required)
1. Supabase dashboard → Authentication → Providers → Google → Enable
2. Google Cloud Console → Create OAuth 2.0 credentials
3. Authorised redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
4. Paste client ID + secret into Supabase
5. Add `NEXT_PUBLIC_SITE_URL=https://your-domain.com` to your `.env.local`

---

## 2026-05-15 — Session 6

### Terminal Window
- New `components/os/TerminalWindow.tsx` — DOS-style black/green terminal with command processor
- **Commands:** `about`, `skills`, `projects`, `contact`, `resume`, `snake`, `minesweeper`, `virus` (all open the matching window), `help`, `whoami`, `dir` / `ls`, `date`, `ver`, `echo <msg>`, `cls` / `clear`, `exit` (closes terminal)
- **UX:** Up/Down arrow key command history, auto-scroll on new output, click anywhere to focus input, `playClick` / `playError` sounds on commands
- `whoami` output reads from the live Supabase profile (name, tagline, location, availability)
- `dir` shows a styled DOS directory listing of all desktop "files"
- Unknown commands display the classic "not recognized as internal or external command" error in red
- Added `"terminal"` WindowId to `WindowManager.tsx` (520×360 default size)
- Desktop icon 💻 at column 2, row 4; Start Menu entry added under the separator

---

## 2026-05-15 — Session 5

### Contact Window Polish
- `ContactWindow.tsx` fully rewritten with three phases: **form → sending → result**
- **Sending dialog** — Win95 modal overlay with fake animated progress bar (accelerates to 90%, jumps to 100% on server response), a "packet transfer" readout showing From/To/Packets sent/Status
- **MessageBox popup** — Win95-style dialog (blue titlebar, icon, message, OK button) for both success (✅ "Message Transmitted!") and error (⚠️ "Transmission Failed") states
- `playSuccess()` / `playError()` from sounds lib wired to send outcomes; `playClick()` on OK button
- Validation error still shows inline with `playError()` sound before showing the sending dialog
- Form fields disabled during transmission

---

## 2026-05-15 — Session 4

### Sound Effects (Web Audio API — no audio files)
- New `lib/sounds.ts` — all sounds generated via `OscillatorNode` + `GainNode`. Exports: `playStartup`, `playWindowOpen`, `playWindowClose`, `playMinimize`, `playRestore`, `playClick`, `playError`, `playSuccess`. Global `muted` flag via `setMuted` / `getMuted`.
- **Startup chime** — 4-note ascending arpeggio (C4 E4 G4 C5) fires when the desktop first loads (`PortfolioOS.tsx`)
- **Window open** — rising two-tone bloop on every window mount (`Win95Window.tsx` `useEffect []`)
- **Window close** — falling two-tone on close button click
- **Minimize** — downward frequency sweep on minimize button click
- **Maximize click** — short tick on maximize/restore button
- **Mute toggle** — 🔊/🔇 speaker button added to taskbar system tray (next to clock); persists in module-level state

---

## 2026-05-15 — Session 3

### Resume PDF Preview
- `ResumeWindow.tsx` fully rewritten — now renders the PDF in an `<iframe>` so visitors can read it directly in the window
- Added Win95-style toolbar above the iframe: filename, Download button, and Open in Tab button
- "No resume" placeholder preserved for when no PDF is uploaded
- Default Resume window size bumped from 360×280 → 520×560 in `WindowManager.tsx`

---

## 2026-05-15 — Session 2

### Screensaver
- New `components/os/Screensaver.tsx` — starfield warp animation on an HTML canvas with a bouncing "DevOS 98" label that cycles hue colors (classic After Dark style)
- Idle detection added to `Desktop.tsx` — tracks `mousemove`, `keydown`, `mousedown`, `touchstart`; checks every 5s; triggers after 30s of inactivity
- Dismissed by any interaction (click, keypress, touch); resets idle timer on dismiss
- Rendered at z-index 5000, cursor hidden during screensaver

---

## 2026-05-15 — Session 1

### Bug Fixes (Next.js 15 compatibility)
- `lib/supabase.server.ts` — made `createClient()` async, added `await cookies()` (Next.js 15 breaking change)
- `app/admin/layout.tsx` — removed nested `<html>/<body>` tags that caused React hydration errors
- `app/api/projects/[id]/view/route.ts` — awaited `params` (Next.js 15 dynamic route params are now Promises)
- `lib/supabase.server.ts` — fixed implicit `any` type on `setAll` cookie handler

### Win95 Polish
- **Active/inactive window titlebars** — focused window shows navy (`#000080`) titlebar, unfocused shows gray (`#808080`). `WindowManagerProvider` now tracks `activeWindowId`; updated by `openWindow`, `restoreWindow`, `bringToFront`, `closeWindow`.
- **Right-click desktop context menu** — Win95-style popup with Arrange Icons, Refresh, New Folder, Properties (opens About window). Dismisses on click-outside.
- **Desktop icon single-click selection** — single click highlights icon (navy label background + dotted outline), double-click opens window, clicking empty desktop deselects.
- **Window open animation** — 120ms scale-in from 85% / opacity 0 each time a window opens or restores from minimized state (`win-open` keyframe in globals.css).
