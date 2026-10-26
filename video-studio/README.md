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

## Examples

| Composition | Shows |
|---|---|
| `title-card` | 1080×1920, 30 fps, 7 s. Arabic RTL kinetic headline, counter, staggered checklist, CTA. GSAP timeline with easing from the motion-design skill. Comes with `cues.json` for the mix. |
| `physics-3d` | 1080×1920, 30 fps, 6 s. Rapier rigid bodies falling onto a floor, then Bloom, Depth of Field, Noise and Vignette from react-postprocessing. Physics is stepped at a fixed 1/fps, so every render is identical. |

## Notes

- WebGL renders through SwiftShader in headless Chromium. It is correct but slow, at about 2–4 s per 1080×1920 frame for the 3D example. Use `--frames 30` while iterating.
- GSAP timelines are thenables. A composition's `seek` must not return a timeline, because `studio.js` would wait on it. Write `seek: (f) => { tl.seek(f / FPS, false); }`.
- `out/`, `public/audio/*` and generated `public/sfx/*.wav` are git-ignored.
