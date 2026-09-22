#!/usr/bin/env node
/**
 * Thank-you mail merge — emails each guest their polaroids from the wall.
 *
 * The Google Sheet (File → Share → "Anyone with the link can view") needs
 * columns (header row, any order, case-insensitive):
 *   Name    — who the email greets ("Thabo", "Thabo & Lerato")
 *   Email   — where it goes
 *   Photos  — polaroid numbers from the wall, e.g. "#12, #47" or "12 47".
 *             Leave blank to auto-match photos signed with the guest's
 *             first name (review with --dry-run before trusting it).
 *
 * Env (.env.local): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   THANKYOU_SHEET_URL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
 *   optional MAIL_FROM, MAIL_REPLY_TO, MAIL_SUBJECT.
 *
 * Usage:
 *   node scripts/send-thankyous.mjs list                 # every photo: #NN, name, time, url
 *   node scripts/send-thankyous.mjs preview              # render one email + polaroids to scripts/out/
 *   node scripts/send-thankyous.mjs send --dry-run       # who gets what — nothing is sent
 *   node scripts/send-thankyous.mjs send                 # the real thing (logs to scripts/out/sent-log.json)
 *   node scripts/send-thankyous.mjs send --only a@b.com  # just one recipient
 *   node scripts/send-thankyous.mjs send --resend        # ignore the sent log
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import nodemailer from "nodemailer";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "scripts", "out");
const SENT_LOG = path.join(OUT, "sent-log.json");

// ---------------------------------------------------------------- env
for (const file of [".env.local", ".env"]) {
  const p = path.join(ROOT, file);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const need = (k) => {
  if (!process.env[k]) {
    console.error(`Missing ${k} — add it to .env.local`);
    process.exit(1);
  }
  return process.env[k];
};

// ---------------------------------------------------------------- cli
const [cmd = "help", ...rest] = process.argv.slice(2);
const flags = new Set(rest.filter((a) => a.startsWith("--")));
const flagVal = (name) => {
  const i = rest.indexOf(name);
  return i >= 0 ? rest[i + 1] : undefined;
};

// ---------------------------------------------------------------- supabase (photos)
async function fetchPhotos() {
  const url = need("SUPABASE_URL");
  const key = need("SUPABASE_SERVICE_ROLE_KEY");
  const res = await fetch(
    `${url}/rest/v1/uploads?select=photo_no,storage_key,created_at,guests(first_name)` +
      `&status=eq.ready&photo_no=not.is.null&order=photo_no.asc`,
    { headers: { apikey: key, authorization: `Bearer ${key}` } },
  );
  if (!res.ok) throw new Error(`Supabase: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return rows.map((r) => ({
    no: r.photo_no,
    name: r.guests?.first_name ?? "guest",
    time: new Date(r.created_at).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }),
    url: `${url}/storage/v1/object/public/photos/${r.storage_key}`,
  }));
}

// ---------------------------------------------------------------- google sheet (guests)
function parseCsv(text) {
  const rows = [[]];
  let cell = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') inQ = false;
      else cell += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { rows.at(-1).push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      rows.at(-1).push(cell); cell = ""; rows.push([]);
    } else cell += c;
  }
  rows.at(-1).push(cell);
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

async function fetchGuests() {
  const raw = flagVal("--sheet") ?? process.env.THANKYOU_SHEET_URL;
  if (!raw) throw new Error("No sheet — set THANKYOU_SHEET_URL in .env.local or pass --sheet <url>");
  const id = raw.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] ?? raw;
  const gid = raw.match(/[#&?]gid=(\d+)/)?.[1] ?? "0";
  const res = await fetch(
    `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`,
    { redirect: "follow" },
  );
  if (!res.ok) {
    throw new Error(
      `Sheet fetch failed (${res.status}) — is sharing set to "Anyone with the link can view"?`,
    );
  }
  const [header, ...rows] = parseCsv(await res.text());
  const col = (names) =>
    header.findIndex((h) => names.includes(h.trim().toLowerCase()));
  const iName = col(["name", "guest", "guests"]);
  const iEmail = col(["email", "email address", "e-mail"]);
  const iPhotos = col(["photos", "photo", "photo numbers", "polaroids", "#"]);
  if (iName < 0 || iEmail < 0) {
    throw new Error(`Sheet needs "Name" and "Email" columns — found: ${header.join(", ")}`);
  }
  return rows
    .map((r) => ({
      name: (r[iName] ?? "").trim(),
      email: (r[iEmail] ?? "").trim().toLowerCase(),
      photoNos: iPhotos >= 0 ? [...(r[iPhotos] ?? "").matchAll(/\d+/g)].map((m) => +m[0]) : [],
    }))
    .filter((g) => g.email.includes("@"));
}

/** Photos per guest: explicit #s from the sheet, else auto-match on signed first name. */
function pickPhotos(guest, photos) {
  if (guest.photoNos.length) {
    const byNo = new Map(photos.map((p) => [p.no, p]));
    const found = guest.photoNos.map((n) => byNo.get(n)).filter(Boolean);
    const missing = guest.photoNos.filter((n) => !byNo.has(n));
    return { photos: found, missing, matched: "sheet" };
  }
  const first = guest.name.split(/[\s&,]+/)[0]?.toLowerCase();
  const auto = first ? photos.filter((p) => p.name.trim().toLowerCase() === first) : [];
  return { photos: auto, missing: [], matched: auto.length ? "auto" : "none" };
}

// ---------------------------------------------------------------- polaroid composer
// Server-side twin of composePolaroid() in src/components/Photobooth.tsx,
// plus the photo number stamped on the chin.
for (const f of existsSync(path.join(ROOT, "scripts", "fonts"))
  ? readdirSync(path.join(ROOT, "scripts", "fonts"))
  : []) {
  if (/\.(ttf|otf)$/i.test(f)) GlobalFonts.registerFromPath(path.join(ROOT, "scripts", "fonts", f));
}
const CURSIVE = `Caveat, "Snell Roundhand", "Bradley Hand", "Comic Sans MS", cursive`;
const SERIF = `"Cormorant Garamond", Georgia, "Times New Roman", serif`;

async function composePolaroid(photo) {
  const img = await loadImage(photo.url);
  let seal = null;
  try { seal = await loadImage(path.join(ROOT, "public", "images", "eland-seal.png")); } catch {}

  const W = 720, PAD = 28, PHOTO = W - PAD * 2, CHIN = 150;
  const c = createCanvas(W, PAD + PHOTO + CHIN);
  const x = c.getContext("2d");
  x.fillStyle = "#FFFEF9";
  x.fillRect(0, 0, c.width, c.height);

  const s = Math.max(PHOTO / img.width, PHOTO / img.height);
  x.save();
  x.beginPath();
  x.rect(PAD, PAD, PHOTO, PHOTO);
  x.clip();
  x.drawImage(img, PAD + (PHOTO - img.width * s) / 2, PAD + (PHOTO - img.height * s) / 2, img.width * s, img.height * s);
  x.restore();

  const chinY = PAD + PHOTO;
  if (seal) x.drawImage(seal, PAD + 4, chinY + 26, 64, 64);
  x.fillStyle = "#3A382F";
  x.font = `italic 26px ${SERIF}`;
  x.textAlign = "left";
  x.fillText("Haniel & Zenzi", PAD + 76, chinY + 62);
  x.fillStyle = "#8F8A79";
  x.font = "13px Helvetica, Arial, sans-serif";
  x.fillText("1 7  S E P T E M B E R  2 0 2 6", PAD + 76, chinY + 84);
  x.textAlign = "right";
  x.font = "22px Helvetica, Arial, sans-serif";
  x.fillText(`#${String(photo.no).padStart(2, "0")}`, W - PAD - 6, chinY + 62);
  x.fillStyle = "#3A382F";
  x.font = `44px ${CURSIVE}`;
  x.textAlign = "center";
  x.fillText(photo.name, W / 2, chinY + 128);

  return c.toBuffer("image/jpeg", 92);
}

// ---------------------------------------------------------------- email html
const INK = "#3A382F", MUTE = "#8F8A79", FERN = "#3E5D46", CHAMPAGNE = "#B9A07A", CHARCOAL = "#2F3A2F";
const PALETTE = ["#3F4A3C", "#7B8471", "#C9C2AE", "#EFEAE0", "#A98A64"];

function emailHtml({ guestName, polaroids }) {
  const dots = PALETTE.map(
    (hex) =>
      `<td style="padding:0 5px;"><div style="width:12px;height:12px;border-radius:50%;background:${hex};border:1px solid rgba(255,254,249,.35);font-size:0;line-height:0;">&nbsp;</div></td>`,
  ).join("");

  const rows = [];
  for (let i = 0; i < polaroids.length; i += 2) rows.push(polaroids.slice(i, i + 2));
  const gallery = rows
    .map(
      (pair) => `<tr>${pair
        .map(
          (p) => `
          <td align="center" style="padding:12px 10px;" width="50%">
            <img src="cid:${p.cid}" width="252" alt="Polaroid #${p.no} from the wall"
              style="display:block;width:252px;max-width:100%;border:1px solid #E7DFCE;box-shadow:0 8px 18px rgba(47,58,47,.18);" />
          </td>`,
        )
        .join("")}${pair.length === 1 ? "<td width=\"50%\"></td>" : ""}</tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>Thank you — Haniel &amp; Zenzeleni</title></head>
<body style="margin:0;padding:0;background:#F3EEE3;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3EEE3;">
<tr><td align="center" style="padding:32px 14px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#FFFEF9;border:1px solid #E7DFCE;">

    <!-- header -->
    <tr><td align="center" style="padding:42px 40px 6px;">
      <img src="cid:seal" width="58" height="58" alt="H&amp;Z crest" style="display:block;" />
    </td></tr>
    <tr><td align="center" style="padding:14px 40px 4px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:30px;line-height:1.2;color:${INK};">
      Haniel <span style="color:${FERN};">&amp;</span> Zenzeleni
    </td></tr>
    <tr><td align="center" style="padding:2px 40px 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:3px;color:${MUTE};">
      17 SEPTEMBER 2026 &nbsp;&middot;&nbsp; GREEN LEAVES
    </td></tr>
    <tr><td align="center" style="padding:22px 40px 8px;">
      <div style="width:64px;border-top:1px solid ${CHAMPAGNE};font-size:0;line-height:0;">&nbsp;</div>
    </td></tr>

    <!-- letter -->
    <tr><td style="padding:16px 44px 6px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.75;color:${INK};">
      <p style="margin:0 0 18px;">Dear ${guestName},</p>
      <p style="margin:0 0 18px;">Thank you for celebrating with us at Green Leaves. From the vows beneath the trees to the very last song, having you there made the day everything we hoped it would be&nbsp;&mdash; we felt every hug, every toast and every turn on the dance floor.</p>
      <p style="margin:0 0 18px;">The photo wall caught you in the act. ${
        polaroids.length === 1 ? "Here is your polaroid" : "Here are your polaroids"
      } from the night&nbsp;&mdash; yours to keep.</p>
    </td></tr>

    <!-- polaroids -->
    ${
      polaroids.length
        ? `<tr><td style="padding:6px 30px 10px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F2E7;border:1px solid #EDE5D3;">
        <tr><td align="center" style="padding:20px 12px 2px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:16px;color:${MUTE};">fresh off the wall</td></tr>
        <tr><td style="padding:4px 8px 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${gallery}</table></td></tr>
      </table>
    </td></tr>`
        : ""
    }

    <!-- sign-off -->
    <tr><td style="padding:18px 44px 40px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.75;color:${INK};">
      <p style="margin:0 0 4px;">With love and gratitude,</p>
      <p style="margin:0;font-style:italic;font-size:24px;">Haniel &amp; Zenzeleni</p>
    </td></tr>

    <!-- footer -->
    <tr><td style="background:${CHARCOAL};padding:34px 40px 30px;" align="center">
      <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:20px;color:#F7F1E6;">H&middot;Z</div>
      <div style="padding-top:10px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:16px;color:#F7F1E6;">Haniel &amp; Zenzeleni</div>
      <div style="padding-top:6px;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:2.5px;color:#C9C2AE;">THURSDAY &nbsp;17&nbsp;SEPTEMBER&nbsp;2026</div>
      <div style="padding-top:4px;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#A8B2A0;">Green Leaves Country Lodge &nbsp;&middot;&nbsp; Skeerpoort, Hartbeespoort</div>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px auto 0;"><tr>${dots}</tr></table>
      <div style="padding-top:18px;font-family:Georgia,'Times New Roman',serif;font-size:13px;color:#C9C2AE;">Chidavose &nbsp;&middot;&nbsp; Zondo</div>
      <div style="padding-top:12px;font-family:Helvetica,Arial,sans-serif;font-size:12px;">
        <a href="https://hanielandzenzi.co.za" style="color:#C9C2AE;text-decoration:underline;">hanielandzenzi.co.za</a>
      </div>
      <div style="padding-top:16px;font-family:Helvetica,Arial,sans-serif;font-size:10.5px;line-height:1.6;color:#7E8A78;">
        You&rsquo;re receiving this note because you celebrated with us on the day.<br/>Sent once, with love &mdash; no list, no follow-ups.
      </div>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}

// ---------------------------------------------------------------- commands
async function buildMessage(guest, picked) {
  const polaroids = [];
  for (const p of picked.photos) {
    polaroids.push({
      no: p.no,
      cid: `polaroid-${p.no}`,
      filename: `hz-polaroid-${String(p.no).padStart(2, "0")}.jpg`,
      buffer: await composePolaroid(p),
    });
  }
  const html = emailHtml({ guestName: guest.name || "friend", polaroids });
  const attachments = [
    { filename: "eland-seal.png", path: path.join(ROOT, "public", "images", "eland-seal.png"), cid: "seal" },
    ...polaroids.map((p) => ({ filename: p.filename, content: p.buffer, cid: p.cid })),
  ];
  return { html, attachments, polaroids };
}

if (cmd === "list") {
  const photos = await fetchPhotos();
  for (const p of photos)
    console.log(`#${String(p.no).padStart(2, "0")}  ${p.name.padEnd(16)} ${p.time}  ${p.url}`);
  console.log(`\n${photos.length} photos on the wall.`);
} else if (cmd === "preview") {
  mkdirSync(OUT, { recursive: true });
  const photos = await fetchPhotos();
  let guest, picked;
  try {
    const guests = await fetchGuests();
    guest = guests[0];
    picked = guest && pickPhotos(guest, photos);
  } catch { /* no sheet yet — fall through to sample */ }
  if (!guest || !picked?.photos.length) {
    guest = { name: "Thabo & Lerato", email: "preview@example.com" };
    picked = { photos: photos.slice(0, 2), missing: [] };
  }
  const { html, polaroids } = await buildMessage(guest, picked);
  let file = html.replaceAll("cid:seal", "../../public/images/eland-seal.png");
  for (const p of polaroids) {
    writeFileSync(path.join(OUT, p.filename), p.buffer);
    file = file.replaceAll(`cid:${p.cid}`, p.filename);
  }
  writeFileSync(path.join(OUT, "preview.html"), file);
  console.log(`Preview → scripts/out/preview.html (open it in a browser)`);
  console.log(`Polaroids → ${polaroids.map((p) => `scripts/out/${p.filename}`).join(", ")}`);
} else if (cmd === "send") {
  const dry = flags.has("--dry-run");
  const only = flagVal("--only")?.toLowerCase();
  const resend = flags.has("--resend");
  mkdirSync(OUT, { recursive: true });
  const sentLog = existsSync(SENT_LOG) ? JSON.parse(readFileSync(SENT_LOG, "utf8")) : {};

  const [photos, guests] = await Promise.all([fetchPhotos(), fetchGuests()]);
  console.log(`${photos.length} photos on the wall · ${guests.length} guests in the sheet\n`);

  const transport = dry
    ? null
    : nodemailer.createTransport({
        host: need("SMTP_HOST"),
        port: +(process.env.SMTP_PORT ?? 587),
        secure: +(process.env.SMTP_PORT ?? 587) === 465,
        auth: { user: need("SMTP_USER"), pass: need("SMTP_PASS") },
      });
  const from = process.env.MAIL_FROM ?? `"Haniel & Zenzeleni" <${process.env.SMTP_USER}>`;
  const subject = process.env.MAIL_SUBJECT ?? "Thank you for celebrating with us 🌿";

  let sent = 0, skipped = 0, failed = 0;
  for (const guest of guests) {
    if (only && guest.email !== only) continue;
    if (!resend && sentLog[guest.email]) {
      console.log(`↷  ${guest.email} — already sent ${sentLog[guest.email].at} (use --resend to repeat)`);
      skipped++;
      continue;
    }
    const picked = pickPhotos(guest, photos);
    const nos = picked.photos.map((p) => `#${p.no}`).join(", ") || "no photos";
    const tag = picked.matched === "auto" ? " (auto-matched by name)" : picked.matched === "none" ? " ⚠ none found" : "";
    if (picked.missing.length) console.log(`   ⚠ ${guest.email}: sheet lists missing numbers ${picked.missing.join(", ")}`);

    if (dry) {
      console.log(`✉  ${guest.name} <${guest.email}> → ${nos}${tag}`);
      continue;
    }
    try {
      const { html, attachments } = await buildMessage(guest, picked);
      await transport.sendMail({
        from,
        to: guest.email,
        replyTo: process.env.MAIL_REPLY_TO,
        subject,
        html,
        attachments,
      });
      sentLog[guest.email] = { at: new Date().toISOString(), photos: picked.photos.map((p) => p.no) };
      writeFileSync(SENT_LOG, JSON.stringify(sentLog, null, 2));
      console.log(`✓  ${guest.name} <${guest.email}> → ${nos}${tag}`);
      sent++;
      await new Promise((r) => setTimeout(r, 1200)); // gentle on the SMTP relay
    } catch (e) {
      console.error(`✗  ${guest.email}: ${e.message}`);
      failed++;
    }
  }
  if (dry) console.log(`\nDry run only — nothing was sent. Drop --dry-run when the list looks right.`);
  else console.log(`\nDone: ${sent} sent, ${skipped} skipped, ${failed} failed. Log: scripts/out/sent-log.json`);
} else {
  console.log(`Usage: node scripts/send-thankyous.mjs <list|preview|send> [--dry-run] [--only email] [--resend] [--sheet url]`);
}
