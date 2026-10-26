// Word timing helpers shared by voiceover.mjs and align.mjs.
//
// words.json format (what compositions import):
//   { "source": "elevenlabs" | "transcript" | "estimate", "duration": 12.4,
//     "words": [{ "w": "شو", "start": 0.12, "end": 0.31 }, ...] }

import { spawnSync } from "node:child_process";

const PUNCT_END = /[.!?؟…]$/;
const PUNCT_SOFT = /[,،;؛:]$/;

export function tokenize(text) {
  return text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
}

export function audioDuration(file) {
  const run = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
  const seconds = Number(run.stdout.trim());
  if (!seconds) throw new Error(`Could not read the duration of ${file}`);
  return seconds;
}

// Speech regions = everything between the silences ffmpeg reports.
export function speechRegions(file, { noise = "-35dB", minSilence = 0.18 } = {}) {
  const run = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", `silencedetect=noise=${noise}:d=${minSilence}`, "-f", "null", "-"], { encoding: "utf8" });
  const duration = audioDuration(file);
  const silences = [];
  let open = null;
  for (const line of run.stderr.split("\n")) {
    const s = /silence_start: ([\d.]+)/.exec(line);
    const e = /silence_end: ([\d.]+)/.exec(line);
    if (s) open = Number(s[1]);
    if (e && open !== null) {
      silences.push([open, Number(e[1])]);
      open = null;
    }
  }
  if (open !== null) silences.push([open, duration]);
  const regions = [];
  let cursor = 0;
  for (const [a, b] of silences) {
    if (a > cursor + 0.02) regions.push([cursor, a]);
    cursor = b;
  }
  if (cursor < duration - 0.02) regions.push([cursor, duration]);
  // Drop blips (encoder tails, clicks) that are too short to hold a word.
  return { duration, regions: regions.filter(([a, b]) => b - a >= 0.08) };
}

// Estimate word times for a known script. Words are laid along the speech
// (silences removed) in proportion to their length. When the script's phrases
// (split at punctuation) match the pauses in the audio one to one, each phrase
// is fitted to its own stretch of speech, which is usually very close. Use
// ElevenLabs timestamps or a Whisper transcript when exact timing matters.
export function estimateWords(script, file) {
  const tokens = tokenize(script);
  const { duration, regions } = speechRegions(file);
  const phrases = [];
  let current = [];
  for (const t of tokens) {
    current.push(t);
    if (PUNCT_END.test(t) || PUNCT_SOFT.test(t)) {
      phrases.push(current);
      current = [];
    }
  }
  if (current.length) phrases.push(current);

  const words =
    phrases.length === regions.length
      ? phrases.flatMap((phrase, i) => spread(phrase, [regions[i]]))
      : spread(tokens, regions);
  return { source: "estimate", duration: round(duration), words };
}

function spread(tokens, regions) {
  const weights = tokens.map((t) => t.replace(/[^\p{L}\p{N}]/gu, "").length + 1.5);
  const total = weights.reduce((a, b) => a + b, 0);
  const speech = regions.reduce((a, [s, e]) => a + (e - s), 0);
  const toReal = (x) => {
    let left = x;
    for (const [s, e] of regions) {
      if (left <= e - s) return s + left;
      left -= e - s;
    }
    return regions.at(-1)[1];
  };
  let acc = 0;
  return tokens.map((w, i) => {
    const a = (acc / total) * speech;
    acc += weights[i];
    const b = (acc / total) * speech;
    return { w, start: round(toReal(a)), end: round(toReal(Math.max(a, b - 0.02))) };
  });
}

// ElevenLabs /with-timestamps alignment (per character) → words.
export function wordsFromCharacters(alignment, duration) {
  const { characters, character_start_times_seconds: starts, character_end_times_seconds: ends } = alignment;
  const words = [];
  let current = null;
  characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (current) words.push(current);
      current = null;
      return;
    }
    if (!current) current = { w: "", start: round(starts[i]), end: round(ends[i]) };
    current.w += ch;
    current.end = round(ends[i]);
  });
  if (current) words.push(current);
  return { source: "elevenlabs", duration: round(duration ?? words.at(-1)?.end ?? 0), words };
}

// Whisper-style JSON ({segments:[{words:[{word,start,end}]}]}) or a flat
// [{word|w|text, start, end}] list → words.
export function wordsFromTranscript(json, duration) {
  const list = Array.isArray(json) ? json : json.words ?? (json.segments ?? []).flatMap((s) => s.words ?? []);
  const words = list
    .map((x) => ({ w: String(x.w ?? x.word ?? x.text ?? "").trim(), start: round(Number(x.start)), end: round(Number(x.end)) }))
    .filter((x) => x.w && Number.isFinite(x.start) && Number.isFinite(x.end));
  if (!words.length) throw new Error("No word-level timings found in the transcript");
  return { source: "transcript", duration: round(duration ?? words.at(-1).end), words };
}

function round(x) {
  return Math.round(x * 1000) / 1000;
}
