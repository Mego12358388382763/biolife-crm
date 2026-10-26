---
name: motion-studio-toolkit
description: Turn Claude into a motion/video studio using a fixed 10-tool stack (anatomy-reveal, anatomy, hairline, motion-design-skill, ai-kit, blender-agents, react-three-rapier, react-postprocessing, GSAP, Openverse) and a 4-step workflow (Claude writes the code → skills shape the look → engines render → Openverse adds sound). Use for ANY video, reel, ad, product reveal, explainer, animated illustration, 3D scene, motion graphics or sound design request — including "اعمل فيديو", "موشن", "أنيميشن", "ريل", "إعلان", "شرح منتج" — and pick only the tools the project actually needs.
---

# Motion studio toolkit (Claude → استوديو موشن)

Source: the free guide «حوّل Claude لاستوديو موشن» by @ModMohna — 10 tools for illustrations, 3D, physics, motion and sound. This skill is the saved, reusable version of that guide for every future video.

## The workflow (طريقة الشغل)

1. **Claude writes the code** — the user describes the video in words; Claude writes all of it as code (HTML/CSS/JS, React, React Three Fiber, Blender via MCP). Never ask the user to hand-animate.
2. **Skills shape the look** — tools 01–05: timing, illustrations, natural motion.
3. **Engines render** — tools 06–09: 3D, physics, post-processing effects, timeline.
4. **Openverse adds sound** — tool 10: free SFX, ambience and music.

**Warning from the guide:** inspect every repo before installing it (README, licence, install scripts, what it executes), and pull in only the tools this specific project needs — not all ten.

## The 10 tools

| # | Tool | Stage | What it does | Use it when | Link |
|---|------|-------|--------------|-------------|------|
| 01 | `/anatomy-reveal` | Look | Explodes a product into separate parts (exploded view) and outputs a ready MP4 product-reveal video | Product ads, launch videos, showing what's inside a product | typingmind.com/skills/annnguyentt-anatomy-reveal |
| 02 | `/anatomy` | Look | Turns machines and systems into interactive isometric illustrations showing how they work inside | Explaining a technical product, a complex system, any idea that needs a diagram | skills.wheresryan.sh/anatomy |
| 03 | `/hairline` | Look | Interactive line-art illustrations from a written idea or your own SVG | Clean thin-line explainer drawings for posts and videos | hairline.lucasmarkes.com/skills |
| 04 | `/motion-design-skill` | Look | Teaches Claude timing, easing and Disney's 12 principles of animation applied to UI | Motion feels robotic or stiff and must feel natural | github.com/LottieFiles/motion-design-skill |
| 05 | `ai-kit` | Look | Motion docs, CSS spring animations and an animation audit, written for AI agents | Have Claude review and improve existing animations instead of guessing | github.com/motiondivision/ai-kit |
| 06 | `/blender-agents` | Render | A full AI 3D team inside Blender, driven by Claude Code over MCP — describe the scene, it builds it | 3D scenes and models without learning Blender | github.com/scenario-labs/blender-plugin |
| 07 | `/react-three-rapier` | Render | Real physics (gravity, collisions, bounce) for React Three Fiber scenes | Objects must move and fall like the real world | github.com/pmndrs/react-three-rapier |
| 08 | `/react-postprocessing` | Render | Cinematic effects in a few lines: Bloom, Depth of Field, film effects | The final touch that takes a scene from "code" to "cinema" | github.com/pmndrs/react-postprocessing |
| 09 | `GSAP` | Render | Timeline animation library for precise motion and scene transitions — now fully free | Any video or page with sequenced motion that needs exact timing | github.com/greensock/GSAP |
| 10 | `/openverse-api` | Sound | 5.2M+ free sound effects, ambience and music | Videos need sound without paying for sound libraries | api.openverse.org/v1/ |

## How to apply it on a video request

1. **Brief** — goal, platform and aspect ratio (reels 9:16 1080×1920; posts 1:1 / 4:5; YouTube 16:9), length, script/voice-over, brand (for Ahmed's brands apply `ahmed-design-standards` and `ahmed-content-voice`; check health claims with `health-claim-check`).
2. **Pick tools** with this map, then state the chosen stack and why before building:
   - Product reveal / "what's inside" → 01 (+ 08 for polish, 10 for sound)
   - Explaining a system, mechanism, body/process diagram → 02 or 03 (+ 09 to sequence the reveal)
   - Kinetic typography, UI, motion graphics, counters, transitions → 09 GSAP + 04 for easing/principles
   - Reviewing/fixing animations that feel wrong → 05 ai-kit (+ 04)
   - 3D scene or object → 06 (Blender) or React Three Fiber; add 07 for physics, 08 for cinematic look
   - Every finished video → 10 Openverse for SFX/music
3. **Vet before install** — open the repo/README, check licence and what install scripts run, then install pinned versions only (`npm i gsap@<exact>`, `@react-three/rapier@<exact>`, `@react-three/postprocessing@<exact>`; skills copied into `.claude/skills/` only after reading them). If the network blocks a source, say so and fall back to what is already available (plain GSAP/CSS from a CDN, the built-in `video-ad-editor-plus` / `reel-render-pipeline` skills).
4. **Build as code in a scratch/project folder outside this CRM's app code** — one HTML/React composition per video. Video work never goes into `app/`, `components/` or `lib/` of BioLife CRM.
5. **Motion quality pass** (from 04/05): ease-out for entrances, ease-in for exits, 150–400 ms for UI moves and longer for scene moves, anticipation + follow-through on hero elements, staggered sequences, nothing linear unless mechanical, respect safe areas for captions/UI.
6. **Sound** — query Openverse (`GET https://api.openverse.org/v1/audio/?q=<term>&license_type=commercial`), keep only licences that allow the use (prefer CC0 / CC BY), and record title, creator, licence and URL for attribution.
7. **Render** — capture the composition to MP4 (Playwright/headless Chromium frame capture + ffmpeg, Blender render, or HyperFrames when the user wants a hosted HeyGen project), mix audio with ffmpeg, then QC: duration, resolution, fps, audio levels, Arabic text shaping/RTL, safe zones.
8. **Deliver** the MP4 plus a short list: tools used, sound credits, and how to tweak timing.

## Quick start from the guide (آخر شي)

Try one tool today: start with **motion-design-skill** if your motion feels stiff, or **Openverse** if your videos are silent.
