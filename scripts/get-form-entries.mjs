#!/usr/bin/env node
/**
 * Prints the entry.NNNN ids of a public Google Form, so they can be pasted
 * into src/app/api/rsvp/route.ts (or set as env vars).
 *
 * Usage:
 *   npm run form:entries -- "https://docs.google.com/forms/d/e/<FORM_ID>/viewform"
 */

const url = process.argv[2];
if (!url) {
  console.error('Usage: npm run form:entries -- "<google form viewform url>"');
  process.exit(1);
}

const formId = url.match(/\/forms\/d\/e\/([^/]+)/)?.[1];
if (formId) console.log(`\nGOOGLE_FORM_ID=${formId}`);

const html = await (await fetch(url)).text();

// Question metadata lives in the FB_PUBLIC_LOAD_DATA_ script blob:
// [ [questionText, ..., [[entryId, ...]] ], ... ]
const blob = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[.*?\]);<\/script>/s)?.[1];
if (!blob) {
  console.error("Could not find form data — is the form public (anyone with link)?");
  process.exit(1);
}

const data = JSON.parse(blob);
const questions = data?.[1]?.[1] ?? [];
console.log("\nQuestions and entry ids:");
for (const q of questions) {
  const title = q?.[1];
  const entryId = q?.[4]?.[0]?.[0];
  if (title && entryId) console.log(`  entry.${entryId}  ←  ${title}`);
}
console.log(
  "\nPaste these into src/app/api/rsvp/route.ts (ENTRY map) or your env vars.\n"
);
