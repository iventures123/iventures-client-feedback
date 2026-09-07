# iVentures Client Feedback

A private, ~3-minute check-in for iVentures Wealth's existing clients — nine
mostly-one-tap questions plus an open text box, logged straight to a Google
Sheet that only the management team sees. No AI, no framework, no build step.

Forked from [`google-reviews-form`](https://github.com/varun4447777/google-reviews-form)'s
`iventures-live` (the public "Share Your Experience" review funnel) — same
mobile-first tap-through mechanics, but this one never asks for a public
Google review and never shows an answer back to the client's RM.

## The flow

| # | Screen | Captures |
|---|---|---|
| 1 | Name (+ city) | Who's answering, and where they're based |
| 2 | Which RM | Who the feedback is about |
| 3 | Services currently using | The shape of the existing relationship |
| 4 | Portfolio & performance | 1–5 + optional note |
| 5 | **How are we doing on each of these?** | Six sub-parts, 1–5 each: communication, responsiveness, follow-ups, reporting & presentation, proactivity, understanding goals — plus an optional note |
| 6 | "How has [RM] been for you personally" | 1–5 + optional note, RM's name filled in live |
| 7 | Recommend score | 0–10 slider + optional reason |
| 8 | New needs | Multi-select cross-sell signals |
| 9 | Phone + email | Optional, for follow-up |
| — | Anything else | Optional open note, then Thank You |

Every choice question carries a free-text "Other" option, and every rating
question has an optional comment box, so a client is never forced to squeeze
their answer into a preset.

## Why this exists

The RM-specific question and its own thank-you copy exist so a client can be
honest about their *individual* relationship manager without worrying the RM
will ever read it — that promise is stated on the welcome screen and repeated
right before the RM rating. **The Sheet this logs to should only ever be shared
with the management team, never with RMs, or that promise breaks.**

Question 5 is the one that earns its keep on a call: a single "rate our
service" star tells you a client is unhappy but never which part to fix.
Six sub-parts on one screen tell you it's follow-ups, not communication —
which is a conversation you can actually have with an RM.

## How it works

- `index.html` / `style.css` / `app.js` / `config.js` — the whole frontend,
  static files, no build step. Edit `config.js` to change the RM roster,
  cities, "new needs" options, or any screen copy.
- `api/submit.js` — a Vercel serverless function. Turns the answers into
  readable labels and logs one row to your Google Sheet.
- `apps-script/Code.gs` — pastes into Google Apps Script to receive that log
  and append a row.

## 1. Set up Google Sheets logging (~3 minutes, one time)

1. Create a new Google Sheet (sheets.new). Name it something like "iVentures
   Client Feedback — Confidential", and make sure only senior management has
   access to it (do not share it with RMs).
2. In the Sheet, go to **Extensions → Apps Script**.
3. Delete any starter code, and paste in the contents of
   [`apps-script/Code.gs`](apps-script/Code.gs).
4. Click **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, authorize it when prompted, then copy the **Web app URL**
   it gives you (looks like `https://script.google.com/macros/s/XXXXX/exec`).
6. That's your `SHEETS_WEBHOOK_URL` — add it as a Vercel environment variable
   in step 2 below.

Every submission lands as one row in a single "Client Feedback" tab — there's
no public/private split like the review form this was forked from, because
everything on this form is private by design.

There is no email alert — check the sheet directly, or turn one on with no
code: **Tools → Notification settings → Any changes are made → Email me right
away.**

## 2. Deploy to Vercel

```bash
npm install -g vercel   # one-time
cd iventures-client-survey
vercel
```

Follow the prompts (create a **new** project — do not link this to the
existing `iventures-lawyers` or `share-your-experience` Vercel projects). Then
set the Sheets webhook as an environment variable:

```bash
vercel env add SHEETS_WEBHOOK_URL
# paste the Apps Script Web app URL from step 1, choose Production (and Preview if you want)
```

Redeploy so the env var takes effect:

```bash
vercel --prod
```

You'll get a URL like `https://iventures-client-feedback-xxxx.vercel.app`.
Turn it into a WhatsApp-shareable link, or a QR code for in-person use.

## Local development

```bash
node dev-server.js
```

Opens the app at `http://localhost:3000` with `/api/submit` working locally
(no Vercel CLI/account needed for this). `vercel dev` also works if you
prefer it.

## Editing content later

- **RM / relationship manager list**: `team` in `config.js`.
- **Services currently using**: `services` in `config.js`.
- **Service-quality sub-parts** (question 5): `serviceQualities` in `config.js`.
  Adding a row there also needs its key + column header added to
  `QUALITY_COLUMNS` in `apps-script/Code.gs`, and a redeploy of the script —
  nothing else changes.
- **Cities**: `cities` / `overseasCities` in `config.js`.
- **"New needs" options**: `newNeeds` in `config.js`.
- **Question wording and order**: `QUESTIONS` array in `app.js`.
- **Link preview card** (WhatsApp/email): `assets/og-image.png` plus the
  `og:` meta tags in `index.html`. The `og:image` and `og:url` tags are
  absolute URLs — if the deployment URL ever changes, update them or the
  preview breaks.

No admin panel by design — these are one-line edits, and editing code directly
means there's no separate settings store to keep in sync across devices.

## Sending this to your top clients

Each client gets the same link — there's no per-client personalization built
in (the RM is a dropdown the client picks, not a pre-filled value). If you
want to track who has/hasn't responded out of your top 500, keep that list in
a separate sheet/CRM and cross-reference by name once responses come in;
adding per-client tracking tokens to the URL was deliberately left out to
keep this a one-file, no-backend form.
