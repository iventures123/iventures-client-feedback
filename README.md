# iVentures Client Feedback

A private check-in for iVentures Wealth's existing clients — fifteen
mostly-one-tap questions plus an open text box, logged straight to a Google
Sheet that only the management team sees. No AI, no framework, no build step.

Forked from [`google-reviews-form`](https://github.com/varun4447777/google-reviews-form)'s
`iventures-live` (the public "Share Your Experience" review funnel) — same
mobile-first tap-through mechanics, but this one never asks for a public
Google review and never shows an answer back to the client's RM.

## The flow

| # | Eyebrow | Screen | Captures |
|---|---|---|---|
| 1 | First things first | Name (+ city) | Who's answering, and where they're based |
| 2 | So we can reach you | **Mobile + email, both required** | How to call and write to them |
| 3 | Your relationship | Which wealth RM | Who the feedback is about |
| 4 | What we look after | Services currently using | Incl. IPO, pre-IPO, investment banking, debt syndication |
| 5 | Your portfolio | Performance **and asset allocation mix** | 1–5 + optional note |
| 6 | Paperwork | Tax reports & statements on time | Always / only when chased / late / a problem |
| 7 | The day to day | **How is [RM] doing on each of these?** | Seven skillsets, 1–5 each: market knowledge, responsiveness, follow-through, understanding goals, **explaining new products (AIF, PMS, fixed income)**, proactivity, reporting |
| 8 | Beyond the basics | **What has [RM] walked you through?** | MF, PMS, AIF, fixed income, venture funds, global ETFs, **a review of existing holdings** |
| 9 | Just between us | Overall verdict on [RM] | 1–5 across everything above, + optional note |
| 10 | Staying in touch | Desired contact frequency | Monthly / quarterly / half-yearly / yearly / as needed |
| 11 | The app | iVentures Wealth app | 1–10 with a word per band, **skippable**; a low score reveals an issue picker (UI, speed, login, stale data…) |
| 12 | The big one | Recommend score **+ referrals** | 0–10, then name / number / relationship per person, via the phone's contact picker or typed |
| 13 | Invitation only | Webinar interest | Curated private-client sessions; confirms updates come by email and WhatsApp |
| 14 | Staying in the loop | Email opt-in | Explicit, never pre-selected |
| 15 | Looking ahead | New needs | Cross-sell signals, incl. a Will for every family member |
| — | Last one | Feedback, suggestions or complaints | Optional open box, then Thank You |

Every choice question carries a free-text "Other" option, and every rating
question has an optional comment box, so a client is never forced to squeeze
their answer into a preset.

Screens are labelled by section ("Just between us") rather than "Step 4 of
10" — a visible countdown is itself a cue that this will take a while. The
progress bar still carries position.

### Referrals, and the contact picker

The referral screen uses the browser's **Contact Picker API**, which is
user-mediated by design: the phone draws the picker, and the page receives
only the people actually tapped. The address book is never readable by this
site, and there is no permission prompt to leave hanging.

It exists on Chrome for Android and essentially nowhere else — not Safari on
iOS, not any desktop browser. So typing a name and number is **not a
fallback**; it is the primary path for most of this client base, and the
picker button simply never renders where the API is missing
(`contactPickerSupported()` feature-detects rather than sniffing the user
agent).

It is asked of everyone, whatever they scored. The copy carries the weight
instead of a filter — "entirely optional", and Continue is live the moment the
screen opens, so a client with nothing to offer passes it in a single tap.

### The required fields

Screen 2 is the only screen the form insists on: a mobile number, because it
is what turns a written complaint into a phone call, and an email address
alongside it. It's validated as
7–15 digits — a plausibility check, not an Indian-format check, so an NRI
client's `+971…` number passes. The email is checked loosely — an "@", a dot, something either
side — since a pattern strict enough to reject an unusual-but-valid address
does more harm than a typo, which bounces and gets noticed anyway.

Asking for it that early is a deliberate trade: a contact field before
anything interesting costs some completions, but a client who abandons
halfway is exactly the one worth calling, and this way we still have their
number.

## Why this exists

The RM-specific question and its own thank-you copy exist so a client can be
honest about their *individual* relationship manager without worrying the RM
will ever read it — that promise is stated on the welcome screen and repeated
right before the RM rating. **The Sheet this logs to should only ever be shared
with the management team, never with RMs, or that promise breaks.**

Questions 7 and 8 are the ones that earn their keep on a call: a single "rate our
service" star tells you a client is unhappy but never which part to fix.
Six sub-parts on one screen tell you it's follow-ups, not communication —
which is a conversation you can actually have with an RM. Question 8 does the
same job by omission: an unticked "global ETFs" box says the client has never
been shown them, without anyone having to criticise their RM to say so.

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
   Client Feedback — Confidential", and make sure only the management team has
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
- **RM skillsets** (question 7): `serviceQualities` in `config.js`. Adding a
  row there also needs its key + column header added to `QUALITY_COLUMNS` in
  `apps-script/Code.gs`, and a redeploy of the script — nothing else changes.
- **Coverage checklist** (question 8): `rmCoverage` in `config.js`. Options
  here are plain chips, so adding one needs no Sheet change — they all land in
  the single "Walked Through" column.
- **Cities**: `cities` / `overseasCities` in `config.js`.
- **"New needs" options**: `newNeeds` in `config.js`.
- **Question wording, order, section labels**: `QUESTIONS` array in `app.js`
  (each entry's `eyebrow`, `title`, `sub`; `title`/`sub` may be functions if
  they need to react to an earlier answer).
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
