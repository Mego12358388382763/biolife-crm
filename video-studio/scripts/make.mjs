#!/usr/bin/env node
// Step 6 "edit, add sound, export" in one command for a voiceover reel:
// render every frame → lay voiceover + the composition's sound cues (+ music)
// → normalise to -14 LUFS → out/<name>-final.mp4.
//
//   node scripts/make.mjs <name> [--music public/audio/track.mp3] [--lufs -14] [--skip-render]

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [name, ...rest] = process.argv.slice(2);
const opts = {};
for (let i = 0; i < rest.length; i++) {
  if (rest[i] === "--skip-render") opts.skipRender = true;
  else opts[rest[i].replace(/^--/, "")] = rest[++i];
}
if (!name) {
  console.error("usage: node scripts/make.mjs <composition> [--music file] [--lufs -14] [--skip-render]");
  process.exit(1);
}

const node = (script, args) => {
  const run = spawnSync(process.execPath, [resolve(ROOT, "scripts", script), ...args], { stdio: "inherit", cwd: ROOT });
  if (run.status !== 0) process.exit(run.status ?? 1);
};

const video = `out/${name}.mp4`;
if (!opts.skipRender) node("render.mjs", [name, "--out", video]);
node("sfx.mjs", []);

const args = [video];
if (existsSync(resolve(ROOT, `out/${name}.cues.json`))) args.push(`out/${name}.cues.json`);
const voice = `compositions/${name}/voiceover.mp3`;
if (existsSync(resolve(ROOT, voice))) args.push("--voice", voice);
if (opts.music) args.push("--music", opts.music);
args.push("--lufs", opts.lufs ?? "-14", "--out", `out/${name}-final.mp4`);
node("mix.mjs", args);
