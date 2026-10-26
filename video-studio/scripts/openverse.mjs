#!/usr/bin/env node
// Search and download free sound from Openverse (api.openverse.org), keeping credits.
//
//   node scripts/openverse.mjs search "whoosh" [--license commercial] [--max 10]
//   node scripts/openverse.mjs get <id> [--name whoosh]
//
// search prints id, title, creator, licence and duration. get downloads the file
// to public/audio/<name>.<ext> and appends its attribution to public/audio/CREDITS.md.
// Licences: "commercial" (default) only returns sounds that may be used in ads;
// prefer CC0 / PDM, then CC BY (credit required). Never use NC or ND sounds in ads.
// Anonymous use is rate limited; set OPENVERSE_TOKEN for a registered client token.

import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://api.openverse.org/v1";
const AUDIO_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../public/audio");

const [command, arg, ...rest] = process.argv.slice(2);
const opts = {};
for (let i = 0; i < rest.length; i += 2) opts[rest[i].replace(/^--/, "")] = rest[i + 1];

const headers = { "User-Agent": "biolife-video-studio" };
if (process.env.OPENVERSE_TOKEN) headers.Authorization = `Bearer ${process.env.OPENVERSE_TOKEN}`;

async function api(path) {
  const res = await fetch(`${API}${path}`, { headers });
  if (!res.ok) throw new Error(`Openverse ${res.status} ${res.statusText} for ${path}`);
  return res.json();
}

async function search(query) {
  const params = new URLSearchParams({ q: query, page_size: opts.max ?? "10", license_type: opts.license ?? "commercial" });
  const data = await api(`/audio/?${params}`);
  for (const r of data.results) {
    const secs = r.duration ? (r.duration / 1000).toFixed(1) + "s" : "?";
    console.log(`${r.id}  ${secs.padStart(7)}  ${r.license.toUpperCase()} ${r.license_version ?? ""}  ${r.title} — ${r.creator ?? "unknown"}`);
  }
  console.log(`\n${data.result_count} results. Download one with: node scripts/openverse.mjs get <id> --name <file-name>`);
}

async function get(id) {
  const r = await api(`/audio/${id}/`);
  if (/(^|-)n[cd]/.test(r.license)) throw new Error(`Refusing ${r.license}: non-commercial / no-derivatives sound`);
  const ext = extname(new URL(r.url).pathname) || `.${r.filetype ?? "mp3"}`;
  const name = (opts.name ?? r.title).replace(/[^\p{L}\p{N}_-]+/gu, "-").slice(0, 60);
  mkdirSync(AUDIO_DIR, { recursive: true });
  const file = resolve(AUDIO_DIR, `${name}${ext}`);
  const res = await fetch(r.url, { headers: { "User-Agent": headers["User-Agent"] } });
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${r.url}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  const credits = resolve(AUDIO_DIR, "CREDITS.md");
  if (!existsSync(credits)) writeFileSync(credits, "# Sound credits\n\n");
  appendFileSync(credits, `- ${name}${ext}: "${r.title}" by ${r.creator ?? "unknown"} — ${r.license.toUpperCase()} ${r.license_version ?? ""} — ${r.foreign_landing_url ?? r.url}\n`);
  console.log(`saved ${file}\n${r.attribution ?? ""}`);
}

try {
  if (command === "search" && arg) await search(arg);
  else if (command === "get" && arg) await get(arg);
  else {
    console.error('usage: node scripts/openverse.mjs search "<query>" [--license commercial] [--max 10]\n       node scripts/openverse.mjs get <id> [--name file-name]');
    process.exit(1);
  }
} catch (err) {
  console.error(err.cause?.code === "ECONNREFUSED" || /fetch failed/.test(err.message)
    ? `Could not reach api.openverse.org (${err.cause?.code ?? err.message}). The network may block it; use npm run sfx for generated sound instead.`
    : err.message);
  process.exit(1);
}
