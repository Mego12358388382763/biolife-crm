---
name: motion-studio-toolkit
description: Turn Claude into a motion/video studio using the 10-tool stack from the "حوّل Claude لاستوديو موشن" guide — installed in this repo as skills (anatomy-reveal, anatomy, hairline-create/adopt, motion-design, motion) plus the video-studio/ workspace (GSAP, React Three Fiber + Rapier physics + postprocessing, Openverse/generated sound, MP4 renderer). Use for ANY video, reel, ad, product reveal, explainer, animated illustration, 3D scene, motion graphics or sound design request — including "اعمل فيديو", "موشن", "أنيميشن", "ريل", "إعلان", "شرح منتج" — and pick only the tools the project actually needs.
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
