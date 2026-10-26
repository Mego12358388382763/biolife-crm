#!/usr/bin/env node
// Lay voiceover, sound effects and optional music under a rendered video, then
// normalise loudness for social platforms.
//
//   node scripts/mix.mjs <video.mp4> [cues.json] [--voice file] [--music file]
//        [--music-volume 0.25] [--gain 2.5] [--lufs -14] [--out file.mp4]
//
// cues.json: [{ "sound": "sfx/whoosh.wav", "at": 0.35, "volume": 0.8 }, ...]
// (sound paths are relative to public/). The renderer writes one next to the
// video when the composition publishes cues. Music ducks under the voice and
// fades out over the last second. --lufs runs a two-pass EBU R128 loudnorm
// (true peak under -1 dBTP). The video stream is copied, never re-encoded.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";
const positional = [];
const opts = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith("--")) opts[argv[i].slice(2)] = argv[++i];
  else positional.push(argv[i]);
}
const [videoArg, cuesArg] = positional;
if (!videoArg) {
  console.error("usage: node scripts/mix.mjs <video.mp4> [cues.json] [--voice file] [--music file] [--music-volume 0.25] [--gain 2.5] [--lufs -14] [--out file.mp4]");
  process.exit(1);
}

const video = resolve(ROOT, videoArg);
const cues = cuesArg ? JSON.parse(readFileSync(resolve(ROOT, cuesArg), "utf8")) : [];
const out = resolve(ROOT, opts.out ?? video.replace(/\.mp4$/, "-mixed.mp4"));
const premix = out.replace(/\.mp4$/, ".premix.wav");

const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video], { encoding: "utf8" });
const duration = Number(probe.stdout.trim());
if (!duration) fail(`Could not read duration of ${video}`);

function fail(message) {
  console.error(message);
  process.exit(1);
}

function ffmpeg(args, capture = false) {
  const run = spawnSync(FFMPEG, ["-y", "-hide_banner", ...args], { encoding: "utf8", stdio: capture ? "pipe" : ["ignore", "inherit", "inherit"] });
  if (run.status !== 0) fail(capture ? run.stderr.slice(-1500) : "ffmpeg failed");
  return run;
}

// 1. Premix every source into one stereo WAV.
const inputs = [];
const chains = [];
const labels = [];
let n = 0;
const fmt = "aformat=sample_rates=48000:channel_layouts=stereo";

let voiceLabel = null;
if (opts.voice) {
  const file = resolve(ROOT, opts.voice);
  if (!existsSync(file)) fail(`Missing voiceover ${file}`);
  inputs.push("-i", file);
  chains.push(`[${n}:a]${fmt},asplit=2[v][vsc]`);
  voiceLabel = "[v]";
  labels.push("[v]");
  n++;
}

cues.forEach((cue, i) => {
  const file = resolve(ROOT, "public", cue.sound);
  if (!existsSync(file)) fail(`Missing sound ${file} (run npm run sfx first?)`);
  inputs.push("-i", file);
  const ms = Math.round(cue.at * 1000);
  chains.push(`[${n}:a]${fmt},volume=${cue.volume ?? 1},adelay=${ms}|${ms}[c${i}]`);
  labels.push(`[c${i}]`);
  n++;
});

if (opts.music) {
  inputs.push("-i", resolve(ROOT, opts.music));
  const fadeStart = Math.max(0, duration - 1);
  chains.push(`[${n}:a]${fmt},atrim=0:${duration},volume=${opts["music-volume"] ?? 0.25},afade=t=out:st=${fadeStart}:d=1[mraw]`);
  if (voiceLabel) chains.push(`[mraw][vsc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[m]`);
  else chains.push(`[mraw]anull[m]`);
  labels.push("[m]");
  n++;
} else if (voiceLabel) {
  chains.push(`[vsc]anullsink`);
}

if (!labels.length) fail("Nothing to mix: give a cues file, --voice or --music");
chains.push(`${labels.join("")}amix=inputs=${labels.length}:normalize=0:duration=longest,volume=${opts.gain ?? (voiceLabel ? 1 : 2.5)},apad,atrim=0:${duration}[pre]`);
ffmpeg(["-loglevel", "error", ...inputs, "-filter_complex", chains.join(";"), "-map", "[pre]", "-ar", "48000", premix]);

// 2. Loudness: measure, then normalise (two-pass loudnorm), or just limit.
let master;
if (opts.lufs) {
  // Aim 0.5 dB under -1 dBTP: AAC encoding adds a little peak back.
  const target = `I=${opts.lufs}:TP=-1.5:LRA=11`;
  const measure = ffmpeg(["-i", premix, "-af", `loudnorm=${target}:print_format=json`, "-f", "null", "-"], true);
  const m = JSON.parse(measure.stderr.slice(measure.stderr.lastIndexOf("{")));
  master = `loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`;
} else {
  master = "alimiter=limit=0.9";
}

// 3. Mux with the untouched video stream.
ffmpeg(["-loglevel", "error", "-i", video, "-i", premix, "-map", "0:v", "-map", "1:a", "-af", master, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out]);
rmSync(premix, { force: true });

if (opts.lufs) {
  const check = ffmpeg(["-i", out, "-af", "ebur128=peak=true", "-vn", "-f", "null", "-"], true);
  const summary = check.stderr.slice(check.stderr.lastIndexOf("Summary:"));
  const lufs = /I:\s+(-?[\d.]+) LUFS/.exec(summary)?.[1];
  const peak = /Peak:\s+(-?[\d.]+) dBFS/.exec(summary)?.[1];
  console.log(`wrote ${out}  (${lufs} LUFS integrated, true peak ${peak} dBFS)`);
} else {
  console.log(`wrote ${out}`);
}
