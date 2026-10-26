#!/usr/bin/env node
// Step 4 "sync every word" for a voiceover that already exists (recorded, or
// downloaded from ElevenLabs): writes compositions/<name>/words.json.
//
//   node scripts/align.mjs <name> [--audio compositions/<name>/voiceover.mp3]
//        [--transcript whisper.json]
//
// With --transcript (Whisper / CapCut / any JSON with word start/end) the times
// are exact. Without it, times are estimated from script.txt and the pauses in
// the audio: words land on rhythm, but check the sheet and nudge if needed.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { audioDuration, estimateWords, wordsFromTranscript } from "./lib/words.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [name, ...rest] = process.argv.slice(2);
const opts = {};
for (let i = 0; i < rest.length; i += 2) opts[rest[i].replace(/^--/, "")] = rest[i + 1];
if (!name) {
  console.error("usage: node scripts/align.mjs <composition> [--audio file] [--transcript whisper.json]");
  process.exit(1);
}

const dir = resolve(ROOT, "compositions", name);
const audio = resolve(ROOT, opts.audio ?? `compositions/${name}/voiceover.mp3`);
if (!existsSync(audio)) {
  console.error(`No voiceover at ${audio}`);
  process.exit(1);
}

let words;
if (opts.transcript) {
  words = wordsFromTranscript(JSON.parse(readFileSync(resolve(ROOT, opts.transcript), "utf8")), audioDuration(audio));
} else {
  const scriptFile = resolve(dir, "script.txt");
  if (!existsSync(scriptFile)) {
    console.error(`Need ${scriptFile} (or --transcript) to know the words`);
    process.exit(1);
  }
  words = estimateWords(readFileSync(scriptFile, "utf8"), audio);
}

const out = resolve(dir, "words.json");
writeFileSync(out, JSON.stringify(words, null, 2) + "\n");
console.log(`wrote ${out} (${words.words.length} words, ${words.duration}s, ${words.source})`);
