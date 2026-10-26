# Video studio

Code-driven video workspace for the motion stack in `.claude/skills/motion-studio-toolkit`. It is a separate npm package: nothing here is imported by the CRM app, and the CRM's lint and typecheck ignore this folder.

## Setup

```bash
cd video-studio
npm install            # exact versions, see package.json
```

Needs Node 20+, ffmpeg, and Chromium. Playwright is pinned to the browser build preinstalled in Claude cloud sessions. On another machine, run `npx playwright install chromium` or set `CHROME_PATH` to a local Chrome.

## Make a video

1. Copy `compositions/title-card/` (2D/GSAP) or `compositions/physics-3d/` (React Three Fiber) to `compositions/<name>/`.
2. Build the motion. The page must call `registerStudio({ width, height, fps, duration, seek })` from `compositions/studio.js`. `seek(frame)` must draw that exact frame and depend only on the frame number, never on the clock.
3. Preview it live with `npm run dev`, then open `/<name>/`.
4. Render it with `npm run render -- <name>`, which writes `out/<name>.mp4` as H.264 at the composition's own size and fps. Options: `--frames N` for a quick test, `--from F`, `--audio file`, `--crf 18`.
5. Add sound:
   - `npm run sfx` writes generated whoosh, pop, tick, hit, riser and shimmer sounds to `public/sfx/`. They are offline and royalty-free.
   - `npm run openverse -- search "whoosh"`, then `npm run openverse -- get <id> --name whoosh`, downloads free sound and records credits in `public/audio/CREDITS.md`.
   - `npm run mix -- out/<name>.mp4 compositions/<name>/cues.json [--music public/audio/track.mp3]` lays the sounds under the video at their cue times and writes `out/<name>-mixed.mp4`.

## Voiceover reel (script → voice → word sync → scenes → sound → export)

The workflow from the ModMohna "motion video" post, start to finish:

1. **Hook first.** Write `compositions/<name>/script.txt` (copy `voiceover-reel/`). About 150 words is 60–90 s. The first 3 seconds decide whether people stay.
2. **Voice.** Run `npm run voiceover -- <name>`. This calls ElevenLabs `/with-timestamps` (default model `eleven_v3`, stability 0.5) and writes `voiceover.mp3` plus `words.json` with exact word times. It needs `ELEVENLABS_API_KEY`, and `ELEVENLABS_VOICE_ID` or `--voice`, set as environment secrets and never committed.
   - If you made the MP3 yourself: save it as `compositions/<name>/voiceover.mp3` and run `npm run align -- <name>`. That estimates the times from the script and the pauses, or reads them exactly with `--transcript whisper.json`.
   - For a draft with no key: `npm run voiceover -- <name> --engine espeak` gives a robotic offline scratch voice. Replace it before export.
3. **Word sync.** `compositions/reel.js` turns `words.json` into kinetic captions. Each word lands as it is spoken, and `hot` words get a gold highlight, a bounce and a pop.
4. **Scenes in plain language.** Each entry in `scenes.js` opens with the sentence it was built from. Its timing comes from the voice (`at("word")`), never from hand keyframes.
5. **Review.** `npm run render -- <name> --stills 0.5,4,9` writes a contact sheet. Fix anything there before the full render.
6. **Export.** `npm run make -- <name> [--music file]` does the rest in one command:
   - renders 1080×1920 at 60 fps;
   - adds the voice, a whoosh/pop/hit cue on every motion, and music that ducks under the voice;
   - normalises to −14 LUFS with true peak under −1 dBTP;
   - writes `out/<name>-final.mp4`.

   For landscape, set `format` in `scenes.js` to 1920×1080.

## Examples

| Composition | Shows |
|---|---|
| `title-card` | 1080×1920, 30 fps, 7 s. Arabic RTL kinetic headline, counter, staggered checklist, CTA. GSAP timeline with easing from the motion-design skill. Comes with `cues.json` for the mix. |
| `voiceover-reel` | 1080×1920, 60 fps. The voiceover workflow above: script, espeak scratch voice, estimated `words.json`, five plain-language scenes (hook, After Effects slashed, code collapses to 0, three chips, Claude stamp), 21 auto sound cues. |
| `physics-3d` | 1080×1920, 30 fps, 6 s. Rapier rigid bodies falling onto a floor, then Bloom, Depth of Field, Noise and Vignette from react-postprocessing. Physics is stepped at a fixed 1/fps, so every render is identical. |

## Notes

- WebGL renders through SwiftShader in headless Chromium. It is correct but slow, at about 2–4 s per 1080×1920 frame for the 3D example. Use `--frames 30` while iterating.
- GSAP timelines are thenables. A composition's `seek` must not return a timeline, because `studio.js` would wait on it. Write `seek: (f) => { tl.seek(f / FPS, false); }`.
- `out/`, `public/audio/*`, generated `public/sfx/*.wav` and `compositions/*/voiceover.mp3` are git-ignored. Regenerate the demo voice with `npm run voiceover -- voiceover-reel --engine espeak`.
