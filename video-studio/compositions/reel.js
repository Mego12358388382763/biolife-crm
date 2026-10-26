// Voiceover-driven reel engine. A composition provides:
//   - words.json (from scripts/voiceover.mjs or scripts/align.mjs)
//   - scenes.js: format, hot words, and scenes described in plain language
//     and written as small GSAP builders.
// This file turns those into one deterministic GSAP timeline: kinetic captions
// that hit on each spoken word, the scenes, and a sound cue for every motion.
import gsap from "gsap";
import { registerStudio } from "./studio.js";

const clean = (w) => w.replace(/[^\p{L}\p{N}]/gu, "");
const BREAK = /[.!?؟…,،;؛:]$/;

export function buildReel({ words: data, format, hot = [], scenes, stage, captionsEl, maxWordsPerLine = 4 }) {
  const words = data.words;
  const tl = gsap.timeline({ paused: true });
  const cues = [];
  const cue = (sound, at, volume = 0.6) => cues.push({ sound, at: Math.max(0, Number(at.toFixed(3))), volume });

  // Find when a word is spoken: at("Claude"), at("كل", 2) for the third "كل".
  // Exact word matches win; a partial match is the fallback ("Effects،" → "Effects").
  const find = (text, nth) => {
    const exact = words.filter((w) => clean(w.w) === clean(text));
    const hits = exact.length ? exact : words.filter((w) => clean(w.w).includes(clean(text)));
    if (!hits[nth]) throw new Error(`Word "${text}" (#${nth}) is not in words.json`);
    return hits[nth];
  };
  const at = (text, nth = 0) => find(text, nth).start;
  const endOf = (text, nth = 0) => find(text, nth).end;
  const hotSet = new Set(hot.map(clean));
  const duration = data.duration + (format.tail ?? 0.8);

  // --- Captions: lines of up to N words, broken at punctuation. ---
  const lines = [];
  let line = [];
  words.forEach((w, i) => {
    line.push({ ...w, i });
    if (BREAK.test(w.w) || line.length === maxWordsPerLine) {
      lines.push(line);
      line = [];
    }
  });
  if (line.length) lines.push(line);

  lines.forEach((ln, li) => {
    const el = document.createElement("div");
    el.className = "cap-line";
    captionsEl.append(el);
    const show = Math.max(0, ln[0].start - 0.08);
    const next = lines[li + 1];
    const hide = next ? Math.max(show + 0.1, next[0].start - 0.08) : duration - 0.3;
    tl.set(el, { autoAlpha: 1 }, show).set(el, { autoAlpha: 0 }, hide);
    if (li > 0) cue("sfx/tick.wav", show, 0.25);

    ln.forEach((w) => {
      const span = document.createElement("span");
      span.className = "cap-word";
      // Reel captions drop trailing punctuation; it reads as noise on screen (and flips in RTL).
      span.textContent = w.w.replace(/[.!?؟…,،;؛:]+$/, "");
      const isHot = hotSet.has(clean(w.w));
      if (isHot) span.classList.add("hot");
      el.append(span, " ");
      tl.fromTo(span, { opacity: 0, y: 36, scale: 0.9, filter: "blur(10px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.28, ease: "expo.out" }, Math.max(0, w.start - 0.04));
      tl.to(span, { color: "var(--gold)", duration: 0.06 }, w.start);
      if (isHot) {
        tl.fromTo(span, { scale: 1.35 }, { scale: 1, duration: 0.45, ease: "back.out(3)" }, w.start);
        cue("sfx/pop.wav", w.start, 0.55);
      } else {
        tl.to(span, { color: "var(--ink)", duration: 0.2 }, w.end + 0.12);
      }
    });
  });

  // --- Scenes ---
  scenes.forEach((scene, si) => {
    const start = scene.start({ at, endOf });
    const end = scene.end ? scene.end({ at, endOf }) : scenes[si + 1] ? scenes[si + 1].start({ at, endOf }) : duration;
    const layer = document.createElement("section");
    layer.className = `scene ${scene.className ?? ""}`;
    stage.append(layer);
    const local = gsap.timeline();
    scene.build({ layer, tl: local, at: (t, n) => at(t, n) - start, endOf: (t, n) => endOf(t, n) - start, cue: (s, t, v) => cue(s, start + t, v), length: end - start });
    tl.set(layer, { autoAlpha: 1 }, start).add(local, start);
    if (end < duration) tl.to(layer, { autoAlpha: 0, y: -30, duration: 0.25, ease: "power2.in" }, end - 0.25);
    cue(scene.sound ?? "sfx/whoosh.wav", Math.max(0, start - 0.1), scene.volume ?? 0.45);
  });

  tl.set({}, {}, duration);

  registerStudio({
    width: format.width,
    height: format.height,
    fps: format.fps,
    duration,
    cues: cues.sort((a, b) => a.at - b.at),
    seek: (frame) => {
      tl.seek(frame / format.fps, false);
    },
  });
}
