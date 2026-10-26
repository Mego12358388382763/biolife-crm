#!/usr/bin/env node
// Generate royalty-free sound effects locally with ffmpeg — no network, no licence to track.
// Fallback for when Openverse is unreachable, and handy for UI ticks and whooshes.
//
//   node scripts/sfx.mjs            writes every effect to public/sfx/*.wav
//   node scripts/sfx.mjs whoosh pop only the named ones
//
// Place them on a timeline with ffmpeg, e.g. a pop at 2.8 s:
//   ffmpeg -i video.mp4 -i public/sfx/pop.wav -filter_complex "[1]adelay=2800|2800[a]" -map 0:v -map "[a]" -c:v copy out.mp4

import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../public/sfx");

// Each effect is an ffmpeg lavfi source graph plus its duration in seconds.
const EFFECTS = {
  whoosh: ["anoisesrc=color=pink:amplitude=0.6,bandpass=f=900:w=1400,afade=t=in:d=0.25,afade=t=out:st=0.25:d=0.35", 0.6],
  pop: ["sine=f=880,afade=t=out:d=0.08,volume=0.7", 0.09],
  tick: ["sine=f=2200,afade=t=out:d=0.03,volume=0.5", 0.035],
  hit: ["sine=f=55,afade=t=out:d=0.45,volume=1.6", 0.5],
  riser: ["aevalsrc='0.4*sin(2*PI*(200+900*t*t/4)*t)':s=48000,afade=t=in:d=1.5", 2],
  shimmer: ["aevalsrc='0.15*sin(2*PI*1760*t)*sin(2*PI*6*t)+0.12*sin(2*PI*2637*t)':s=48000,afade=t=in:d=0.2,afade=t=out:st=0.6:d=0.6", 1.2],
};

const wanted = process.argv.slice(2);
const names = wanted.length ? wanted : Object.keys(EFFECTS);
mkdirSync(OUT, { recursive: true });

for (const name of names) {
  const effect = EFFECTS[name];
  if (!effect) {
    console.error(`unknown effect "${name}"; choose from ${Object.keys(EFFECTS).join(", ")}`);
    process.exit(1);
  }
  const [graph, seconds] = effect;
  const file = resolve(OUT, `${name}.wav`);
  const run = spawnSync(process.env.FFMPEG_PATH || "ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", graph, "-t", String(seconds), "-ac", "2", "-ar", "48000", file], { stdio: "inherit" });
  if (run.status !== 0) process.exit(run.status ?? 1);
  console.log(`wrote ${file}`);
}
