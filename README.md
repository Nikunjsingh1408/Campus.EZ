# Campus.EZ — one board, sorted for you

**Problem.** Campus information lives everywhere except one place: WhatsApp
groups, department notice boards, emails, posters, LMS announcements. A
student misses a fee deadline because it was on a physical board they didn't
walk past, or scrolls through 40 irrelevant messages to find the one notice
that actually applies to them.

**Solution.** Campus.EZ is a personalized, real-time campus notice hub. An
Admin (faculty/class rep) photographs or uploads a notice/circular/poster.
**Gemini (multimodal)** reads it and returns a structured object — a clean
title, a plain-language summary, a category, and exactly which branch/year/
club it applies to. It's published live, and every Student only ever sees
what's actually theirs, instantly, in a calendar + feed view. Admins can also
post video announcements straight to the board, and students can set a
personal alarm on any task so nothing slips through.

## How it works

1. **Intro video** plays on launch (`public/intro-video.mp4`), with sound on.
2. **Role select** — Student or Admin.
3. **Admin** uploads a notice photo/PDF. Gemini extracts structured data,
   Admin can edit it, then publishes it to the live board. Admin can also
   upload a video announcement directly (no Gemini step — title/summary/
   targeting are filled in by hand) for things like event kickoffs or
   recorded briefings.
4. **Student** picks branch + year + interests once. Their dashboard
   subscribes in real time to the board and only shows what matches —
   an Admin's post (photo-parsed notice or video announcement) appears on
   a Student's screen within moments, on any device. Students can set a
   reminder alarm on any task; Campus.EZ fires a browser notification (or
   an in-app toast if notifications are blocked) at that time.

## Where Gemini does the work

`src/lib/gemini.js` sends the uploaded image/PDF straight to the Gemini API
(`gemini-3.5-flash`, multimodal) with a structured-output prompt, and gets
back JSON: `title`, `summary`, `category`, `branches`, `years`, `clubs`,
`date`, `urgent`. This is the actual AI step — turning an unstructured photo
of a notice into a routable, personalized piece of data. The branch/year
options in that prompt are pulled from `src/data/domains.js`, so extending
the domain list keeps Gemini's output in sync automatically.

## Where the real-time sync comes from

`src/lib/noticesStore.js` and `src/lib/firebase.js` — notices live in a
Firestore collection. Every Student dashboard holds an open `onSnapshot`
listener, so an Admin's post shows up everywhere instantly, no refresh
needed. If Firebase isn't configured yet, the app falls back to
browser-local storage so it still runs for a quick demo on one machine —
but cross-device real-time requires the Firebase setup below.

## Video announcements

`src/lib/mediaStorage.js` uploads the Admin's video to **Firebase Storage**
and stores the resulting download URL on the notice document, so it syncs
and plays back the same way a photo-parsed notice does — filtered by branch/
year/club just like everything else. If no Storage bucket is configured yet,
it falls back to a local, this-browser-only object URL (same fallback
philosophy as the Firestore/local-storage split above).

**To enable it for real:** in the [Firebase console](https://console.firebase.google.com),
open your project → **Build → Storage → Get started** (choose production or
test mode rules), then copy the bucket name into `VITE_FIREBASE_STORAGE_BUCKET`
in your `.env` (it's usually already filled in when you copy your Firebase
web app config — see step 3 below).

## Task alarms

`src/lib/alarms.js` lets a student set a reminder time on any notice card.
It requests Notification permission on first use, schedules a timer, and
persists the alarm to `localStorage` so a page reload before the alarm time
doesn't lose it. When the time comes, it fires a real browser notification
(shown even if the tab is just backgrounded) — or, if notifications are
blocked/unsupported, an in-app toast instead.

**Honest limitation:** this is a client-side timer, not a true push
notification — it only fires while the browser tab/window is still open
(background is fine, fully closed is not). Reminders that need to arrive
after the browser is closed would need a service worker + Firebase Cloud
Messaging + a small backend trigger — a solid "what's next" item, not wired
up in this MVP.

## Domains / filters

Branches, years, and clubs all live in one place — `src/data/domains.js` —
and are consumed by onboarding, the sidebar filters, the Gemini prompt, and
the admin video form. Add a branch or club there and it shows up everywhere
without touching any other file.

## Tech stack

- React + Vite + Tailwind (frontend)
- Gemini API via `@google/genai` (notice parsing/classification)
- Firebase Firestore (real-time shared notice board)
- Firebase Storage (video announcement uploads)

## Setup

### 1. Add your intro video
Drop your video file into `public/intro-video.mp4` (exact name). It tries to
autoplay **with sound** on launch; if a browser's autoplay policy blocks
audible playback outright, it falls back to muted with an Unmute button, and
a "Skip intro" button always shows too.

### 2. Gemini API key
Get a free key at https://aistudio.google.com/app/apikey.

### 3. Firebase project (for real-time sync + video storage)
1. Go to https://console.firebase.google.com → **Add project** (free).
2. Inside the project, click **Build → Firestore Database → Create database**
   (start in test mode for the demo — lock it down with real security rules
   before any real deployment).
3. Click **Build → Storage → Get started** the same way, to enable video
   announcement uploads.
4. Go to **Project settings → General → Your apps → Web app (</>)**, register
   an app, and copy the `firebaseConfig` values it gives you (this includes
   your storage bucket name).

### 4. Environment variables
```bash
cp .env.example .env
# fill in VITE_GEMINI_API_KEY and all VITE_FIREBASE_* values
```

### 5. Run it
```bash
npm install
npm run dev
```

## Deploying

Any static host works (Vercel, Netlify, Firebase Hosting — Firebase Hosting
pairs naturally since you already have the project). Set all the env vars
from `.env` on the host, then `npm run build` and deploy the `dist/` folder.

> Note: Gemini and Firestore are both called directly from the browser here
> for build speed — fine for a hackathon MVP. For production, put Firestore/
> Storage writes behind security rules (already recommended above) and
> consider moving the Gemini call behind a serverless function so the API
> key isn't in the client bundle.

## What's next

- Firestore/Storage security rules restricting writes to authenticated Admin accounts
- True push notifications for alarms (service worker + Firebase Cloud Messaging), so reminders arrive even with the browser closed
- Gemini-powered weekly digest ("here's everything that applied to you this week")
