#!/usr/bin/env node
// Step 3 "give it a voice": turn compositions/<name>/script.txt into
// compositions/<name>/voiceover.mp3 plus words.json (when each word is spoken).
//
//   node scripts/voiceover.mjs <name> [--engine elevenlabs|espeak]
//        [--voice <voice id>] [--model eleven_v3] [--stability 0.5] [--style 0.4]
//
// elevenlabs (default): needs ELEVENLABS_API_KEY in the environment (never in a
//   file in this repo). Uses /with-timestamps, so word times are exact.
//   Default voice: ELEVENLABS_VOICE_ID, else --voice is required.
// espeak: offline robotic scratch voice (espeak-ng) for timing drafts only; word
//   times are estimated from the audio. Replace it with a real voice before export.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { audioDuration, estimateWords, wordsFromCharacters } from "./lib/words.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [name, ...rest] = process.argv.slice(2);
const opts = { engine: "elevenlabs", model: "eleven_v3", stability: "0.5" };
for (let i = 0; i < rest.length; i += 2) opts[rest[i].replace(/^--/, "")] = rest[i + 1];

if (!name) {
  console.error("usage: node scripts/voiceover.mjs <composition> [--engine elevenlabs|espeak] [--voice id] [--model eleven_v3] [--stability 0.5]");
  process.exit(1);
}
const dir = resolve(ROOT, "compositions", name);
const scriptFile = resolve(dir, "script.txt");
if (!existsSync(scriptFile)) {
  console.error(`Write the script first: ${scriptFile}`);
  process.exit(1);
}
const script = readFileSync(scriptFile, "utf8").trim();
const mp3 = resolve(dir, "voiceover.mp3");
const wordsFile = resolve(dir, "words.json");

async function elevenlabs() {
  const key = process.env.ELEVENLABS_API_KEY;
  const voice = opts.voice ?? process.env.ELEVENLABS_VOICE_ID;
  if (!key) throw new Error("ELEVENLABS_API_KEY is not set. Add it as an environment secret, or use --engine espeak for a scratch voice.");
  if (!voice) throw new Error("Pass --voice <voice id> or set ELEVENLABS_VOICE_ID.");
  const settings = { stability: Number(opts.stability), similarity_boost: 0.75 };
  if (opts.style) settings.style = Number(opts.style);
  let res;
  try {
    res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ text: script, model_id: opts.model, voice_settings: settings }),
    });
  } catch (err) {
    throw new Error(`Could not reach api.elevenlabs.io (${err.cause?.code ?? err.message}). If the network blocks it, generate the MP3 in ElevenLabs yourself, save it as ${mp3} and run: npm run align -- ${name}`);
  }
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  writeFileSync(mp3, Buffer.from(data.audio_base64, "base64"));
  return wordsFromCharacters(data.alignment, audioDuration(mp3));
}

function espeak() {
  const wav = resolve(dir, ".voiceover.wav");
  const say = spawnSync("espeak-ng", ["-v", opts.voice ?? "ar", "-s", opts.speed ?? "140", "-w", wav, script], { stdio: "inherit" });
  if (say.error?.code === "ENOENT") throw new Error("espeak-ng is not installed (apt-get install espeak-ng)");
  if (say.status !== 0) throw new Error("espeak-ng failed");
  const enc = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", wav, "-af", "apad=pad_dur=0.4", "-ar", "44100", "-b:a", "128k", mp3], { stdio: "inherit" });
  rmSync(wav, { force: true });
  if (enc.status !== 0) throw new Error("ffmpeg could not encode the voiceover");
  return estimateWords(script, mp3);
}

try {
  const words = opts.engine === "espeak" ? espeak() : await elevenlabs();
  writeFileSync(wordsFile, JSON.stringify(words, null, 2) + "\n");
  console.log(`wrote ${mp3}\nwrote ${wordsFile} (${words.words.length} words, ${words.duration}s, ${words.source})`);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
