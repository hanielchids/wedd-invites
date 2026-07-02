# Umshado — Digital Traditional Wedding Invitation

A single-page, mobile-first **digital wedding invitation** in the style of a traditional
South African (isiZulu) celebration. Fully responsive (looks good on phone and desktop),
animated, and **white-label**: every couple is configured from one file.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion**.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm start   # production build
```

---

## Make it a new couple — edit ONE file

Everything on the page (names, date, families, the four traditional-journey steps,
venue, RSVP options, isiZulu/English copy) comes from:

```
src/config/wedding.ts
```

Change the values in the `wedding` object and the whole invitation re-themes itself.
The countdown is driven by `dateISO`; the live timer needs no other changes.

## Sections

`Cover → FamilyCrest → Invitation → OurPath (Indlela Yethu) → Venue → Countdown → RSVP → Footer`,
with a pinned monogram header that appears after the hero. Each section is its own
component in `src/components/` and is independently responsive.

## The cowhide texture

The active texture is **`public/textures/cowhide.jpg`** — a realistic black-and-white
Holstein cowhide photo from **Pexels** ([photo 4909819](https://www.pexels.com/photo/4909819/)).
The [Pexels licence](https://www.pexels.com/license/) is free for commercial use with no
attribution required. `bg-cowhide` in `tailwind.config.ts` points at it.

A **procedurally generated, royalty-free** fallback lives at `public/textures/cowhide.svg`
(organic patches from SVG fractal noise — zero licence questions). To use it instead, point
`bg-cowhide` back to `cowhide.svg`. Tune it via `baseFrequency` (patch size), `seed`
(pattern), and the `feColorMatrix` alpha row (coverage + edge crispness).

To swap in a different photo, drop it in `public/textures/` and update `bg-cowhide`.

## The envelope intro (`EnvelopeGate`)

On first load the whole screen is a cowhide letter sealed with the couple's wax monogram.
Tapping it lifts the seal, swings the full-screen flap open, blooms warm light, then slowly
dissolves to reveal the invitation. Controlled from `wedding.ts`:

```ts
envelope: { enabled: true, hint: "Tap to open" }
```

It plays once per browser session (`sessionStorage`) and is skipped entirely for visitors
who prefer reduced motion. Pacing lives in `EnvelopeGate.tsx` (`OPEN_TO_DISSOLVE`,
`DISSOLVE_DURATION`).

## Real venue photo

Set `venue.image` in `wedding.ts` to a path under `/public` (e.g. `"/venue.jpg"`).
If left `undefined`, a styled cowhide panel stands in.

## Wiring up RSVP

The form posts JSON to `src/app/api/rsvp/route.ts`, which currently validates and logs.
To collect real responses, pick one:

1. **Email** — add `resend`, email the couple from the route. Put `RESEND_API_KEY` in `.env.local`.
2. **Database** — insert into Supabase / Postgres / a Google Sheet from the route.
3. **No-code** — point the form's `fetch` URL (in `RSVPForm.tsx`) at a Formspree/Getform
   endpoint and delete the route.

Never commit secrets; use `.env.local` (git-ignored).

## Design system

Defined in `tailwind.config.ts` + `globals.css`:

- **Palette** — ivory/cream base, near-black ink, oxblood `wine`, champagne `gold`.
- **Type** — Cormorant Garamond (display), EB Garamond (body), Pinyon Script (monogram),
  Jost (eyebrows/labels). Loaded via `next/font`.
- **Motion** — scroll-reveal + hero entrance via Framer Motion, all gated behind
  `prefers-reduced-motion`.

## Deploy

Works out of the box on **Vercel** or **Netlify** (push the repo, import, deploy).
The API route runs as a serverless function on both.
