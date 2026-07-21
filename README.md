# Haniel & Zenzeleni — Green Leaves Wedding

Digital invitation for the wedding celebration at **Green Leaves Country Lodge,
R560 Skeerpoort, Hartbeespoort** — **Thursday, 17 September 2026**.

Minimal-luxury one-pager: Cormorant Garamond + letterspaced Jost, fern &
champagne palette, arch-masked photos, veil-opening preloader, and a dark
forest-green RSVP moment. All copy and details live in one file:
`src/config/wedding.ts`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3005
```

## RSVP setup (this event's own form → sheet)

RSVPs post to `/api/rsvp`, which forwards them to a **Google Form** so they
land in its linked **Google Sheet**. This site needs its own form (do not reuse
the traditional-wedding form):

1. Create a Google Form with exactly these questions, all **short answer**
   except where noted:
   - Full Name
   - Email Address
   - Phone Number
   - Will you attend? — **multiple choice**, options exactly `Yes` and `No`
   - Dietary Requirements
   - Message
   Set it to accept responses from anyone with the link (no sign-in required),
   and link it to a Sheet (Responses → Link to Sheets).
2. Grab the ids:
   ```bash
   npm run form:entries -- "https://docs.google.com/forms/d/e/<FORM_ID>/viewform"
   ```
3. Paste them into `.env` (copy `.env.example`) **or** directly into the
   constants at the top of `src/app/api/rsvp/route.ts`.

Until the form id is configured, the endpoint returns a friendly
"RSVPs are not open yet" error instead of losing responses.

Anti-bot measures (honeypot field, fill-time heuristic, per-IP rate limit,
one-RSVP-per-email) are built in; the Sheet remains the source of truth.

## Photos

- `public/images/couple-1.jpg` — hero (arch mask, portrait crop works best)
- `public/images/couple-2.jpg` — invitation section
- `public/images/venue.jpg` — venue section; until it exists the site renders
  a styled botanical panel instead. Green Leaves photos: https://greenleaves.co.za/venue/

## Deploy

Standard Next.js 14 — deploy to Vercel and set the `GOOGLE_FORM_*` env vars in
the project settings.
