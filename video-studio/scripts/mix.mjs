#!/usr/bin/env node
// Lay sound effects (and optional music) under a rendered video.
//
//   node scripts/mix.mjs <video.mp4> <cues.json> [--music public/audio/track.mp3] [--music-volume 0.25] [--gain 2.5] [--out file.mp4]
//
// cues.json: [{ "sound": "sfx/whoosh.wav", "at": 0.35, "volume": 0.8 }, ...]
// Sound paths are relative to public/. Music is trimmed to the video and faded out
// over the last second. The video stream is copied, never re-encoded.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [videoArg, cuesArg, ...rest] = process.argv.slice(2);
if (!videoArg || !cuesArg) {
  console.error("usage: node scripts/mix.mjs <video.mp4> <cues.json> [--music file] [--music-volume 0.25] [--out file.mp4]");
  process.exit(1);
}
const opts = {};
for (let i = 0; i < rest.length; i += 2) opts[rest[i].replace(/^--/, "")] = rest[i + 1];

const video = resolve(ROOT, videoArg);
const cues = JSON.parse(readFileSync(resolve(ROOT, cuesArg), "utf8"));
const out = resolve(ROOT, opts.out ?? video.replace(/\.mp4$/, "-mixed.mp4"));

const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video], { encoding: "utf8" });
const duration = Number(probe.stdout.trim());
if (!duration) {
  console.error(`Could not read duration of ${video}`);
  process.exit(1);
}

const inputs = ["-i", video];
const chains = [];
const labels = [];

cues.forEach((cue, i) => {
  const file = resolve(ROOT, "public", cue.sound);
  if (!existsSync(file)) {
    console.error(`Missing sound ${file} (run npm run sfx first?)`);
    process.exit(1);
  }
  inputs.push("-i", file);
  const ms = Math.round(cue.at * 1000);
  chains.push(`[${i + 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${cue.volume ?? 1},adelay=${ms}|${ms}[c${i}]`);
  labels.push(`[c${i}]`);
});

if (opts.music) {
  const idx = cues.length + 1;
  inputs.push("-i", resolve(ROOT, opts.music));
  const fadeStart = Math.max(0, duration - 1);
  chains.push(`[${idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:${duration},volume=${opts["music-volume"] ?? 0.25},afade=t=out:st=${fadeStart}:d=1[m]`);
  labels.push("[m]");
}

chains.push(`${labels.join("")}amix=inputs=${labels.length}:normalize=0:duration=longest,volume=${opts.gain ?? 2.5},apad,atrim=0:${duration},alimiter=limit=0.9[aout]`);

const args = ["-y", "-loglevel", "error", ...inputs, "-filter_complex", chains.join(";"), "-map", "0:v", "-map", "[aout]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out];
const run = spawnSync(process.env.FFMPEG_PATH || "ffmpeg", args, { stdio: "inherit" });
if (run.status !== 0) process.exit(run.status ?? 1);
console.log(`wrote ${out}`);
