---
name: motion-studio-toolkit
description: Turn Claude into a motion/video studio using the 10-tool stack from the "حوّل Claude لاستوديو موشن" guide — installed in this repo as skills (anatomy-reveal, anatomy, hairline-create/adopt, motion-design, motion) plus the video-studio/ workspace (GSAP, React Three Fiber + Rapier physics + postprocessing, Openverse/generated sound, MP4 renderer). Includes the six-step voiceover workflow (hook-first script → ElevenLabs voice → word-synced captions → plain-language scenes → auto SFX, −14 LUFS, 1080p60 export). Use for ANY video, reel, ad, product reveal, explainer, animated illustration, 3D scene, motion graphics or sound design request — including "اعمل فيديو", "موشن", "أنيميشن", "ريل", "إعلان", "شرح منتج" — and pick only the tools the project actually needs.
---

# Motion studio toolkit (Claude → استوديو موشن)

This skill saves the free guide «حوّل Claude لاستوديو موشن» by @ModMohna as a reusable setup. The guide covers 10 tools for illustrations, 3D, physics, motion and sound. The tools are installed in this repo:

- **Skills**, in `.claude/skills/`: each was audited and pinned. See `SOURCES.md` beside this file.
- **Engines and sound**, in `video-studio/`: a standalone npm workspace with a deterministic renderer to MP4. See `video-studio/README.md`.

## The workflow (طريقة الشغل)

1. **Claude writes the code.** The user describes the video in words. Claude writes all of it as code and never asks the user to hand-animate.
2. **Skills shape the look.** Tools 01–05 handle timing, illustrations and natural motion.
3. **Engines render.** Tools 06–09 handle 3D, physics, cinematic effects and the timeline.
4. **Openverse adds sound.** Tool 10 provides free SFX, ambience and music.

The guide warns: inspect every repo before installing it, and pull in only the tools this project needs. The ones below are already audited. Re-audit before updating any of them, following `SOURCES.md`.

## Voiceover-driven motion video (the ModMohna six-step post)

Use this as the default for narrated reels and explainers. Commands are in `video-studio/README.md`.

1. **Give Claude the material.** The post used a project ZIP plus a guide PDF. Here, the toolkit and `video-studio/` play the ZIP's role, and the user's brief, guide or PDF is the spec. Read it fully first, prepare the project, then ask for or write the script.
2. **Write the hook first.**
   - The script is the video: every on-screen motion is tied to a spoken word.
   - About 150 words is 60–90 s. The first 3 seconds decide whether people stay.
   - Use `hook-factory` for options and `ahmed-content-voice` for Ahmed's brands.
   - Save it as `compositions/<name>/script.txt`.
3. **Give it a voice.** Run `npm run voiceover -- <name>`. This calls ElevenLabs with an expressive voice, `eleven_v3`, stability 0.5. Energy matters more than a perfect accent.
   - The key goes in the `ELEVENLABS_API_KEY` env secret and is never committed.
   - If the API is blocked here, the user generates the MP3 in ElevenLabs, saves it as `voiceover.mp3`, and runs `npm run align -- <name>`.
   - `--engine espeak` gives a timing draft only.
4. **Claude syncs every word.** `words.json` holds each word's time. Text hits the screen on the rhythm of the voice, and hot words get a highlight, a bounce and a pop.
5. **Describe scenes; never keyframe by hand.**
   - Write each scene in `scenes.js` as one plain sentence of what happens, then the GSAP code that does exactly that, timed with `at("word")`.
   - Apply `motion-design` easing: ease-out in, ease-in out, staggers, anticipation.
6. **Edit, add sound, export.**
   - Review with `--stills`; one sentence of feedback changes the whole video.
   - `npm run make -- <name>` adds an SFX on every motion, ducks the music under the voice, normalises to −14 LUFS, and exports 1080p60.
   - Report the LUFS and true-peak values it prints.

## The 10 tools and where they live here

| # | Tool | Stage | Use it when | Here |
|---|------|-------|-------------|------|
| 01 | anatomy-reveal | Look | Product ads, launch videos, exploded view: what's inside a product. Outputs an MP4 product-reveal film. | skill `anatomy-reveal` |
| 02 | anatomy | Look | Explaining a technical product, a system or mechanism as an interactive isometric machine | skill `anatomy` |
| 03 | hairline | Look | Clean thin-line explainer drawings from an idea, or from an SVG | skills `hairline-create`, `hairline-adopt` |
| 04 | motion-design-skill | Look | Motion feels robotic or stiff. Covers timing, easing, choreography and Disney's 12 principles. | skill `motion-design` |
| 05 | ai-kit | Look | Reviewing and improving animations, CSS springs, Motion best practices | skill `motion` (+ `motion-reviewer-agent.md`) |
| 06 | blender-agents | Render | Complex 3D scenes and models through Blender | Not installed. It is a Blender add-on for the user's own machine (github.com/scenario-labs/blender-plugin, GPL-3.0). In the cloud, build 3D with React Three Fiber in `video-studio` instead. |
| 07 | react-three-rapier | Render | Objects must fall, collide and bounce like the real world | `video-studio`, example `compositions/physics-3d` |
| 08 | react-postprocessing | Render | The cinematic final touch: Bloom, Depth of Field, film noise, vignette | `video-studio`, example `compositions/physics-3d` |
| 09 | GSAP | Render | Any sequenced motion that needs exact timing: kinetic type, counters, transitions | `video-studio`, example `compositions/title-card` |
| 10 | Openverse | Sound | Free SFX and music, with credits | `npm run openverse` in `video-studio`. When it is offline, `npm run sfx` generates sound. |

## How to apply it on a video request

1. **Brief.** Settle the goal, the platform and its aspect ratio (reels 9:16 at 1080×1920; posts 1:1 or 4:5; YouTube 16:9), the length, and the script or voice-over. For Ahmed's brands, also apply `ahmed-design-standards` and `ahmed-content-voice`. Check health claims with `health-claim-check`.
2. **Pick the tools, then state the chosen stack and why** before building:
   - Product reveal or "what's inside": `anatomy-reveal`. It renders its own MP4.
   - Explaining a mechanism, system or process: `anatomy` or `hairline-create`. Capture the figure, or rebuild the reveal as a GSAP composition.
   - Kinetic typography, motion graphics, counters, transitions: a GSAP composition, with `motion-design` for easing and choreography.
   - Fixing animations that feel wrong: `motion` (best-practices, css-spring) plus `motion-design`.
   - A 3D scene: React Three Fiber in `video-studio`. Add Rapier for physics and postprocessing for the cinematic look.
   - Every finished video: sound from Openverse, or generated SFX, laid in with `npm run mix`.
   - Talking-head edits with captions: `video-ad-editor-plus` and `reel-render-pipeline`. Use this toolkit for the motion inserts.
3. **Build in `video-studio/compositions/<name>/`.** Copy the closest example and keep it deterministic: `seek(frame)` depends only on the frame number. Video work never goes into the CRM's `app/`, `components/` or `lib/`.
4. **Motion quality pass** (from `motion-design` / `motion`):
   - Ease-out for entrances, ease-in for exits.
   - 150–400 ms for UI-scale moves, longer for scene moves.
   - Staggers of 60–120 ms.
   - Anticipation and follow-through on the hero element.
   - Nothing linear unless it is mechanical.
   - Text stays inside the 9:16 safe zone.
5. **Render.** Run `npm run render -- <name> --frames 30` to test, then the full render.
6. **Sound.** Run `npm run sfx`, and/or `npm run openverse -- search "<term>"` followed by `get <id>`. Write `cues.json` and run `npm run mix`. Use only licences that allow the use: prefer CC0 or PDM, then CC BY with credit, and never NC or ND in ads.
7. **QC.** Check duration, resolution and fps with `ffprobe`. Check audio peaks with `volumedetect`, aiming for about −10 to −1 dB. Check Arabic shaping and RTL, and safe zones, on extracted frames.
8. **Deliver** the MP4 with a short list: the tools used, the sound credits, and how to tweak timing.

## Quick start from the guide (آخر شي)

Try one tool today: start with **motion-design** if your motion feels stiff, or **Openverse** if your videos are silent.
