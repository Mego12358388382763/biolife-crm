# Vendored tools — sources, pinned commits, audit

Each tool from the guide was cloned at the commit below, read before being copied in (SKILL files, scripts, anything that spawns a process or touches the network), and copied without its `.git`, CI, demo media or generated build outputs.

| Skill folder | Upstream | Commit | Licence | Audit notes |
|---|---|---|---|---|
| `anatomy-reveal/` | github.com/annnguyentt/anatomy-reveal-skill | `dd01e1c04559` | MIT | Scripts spawn local Chrome, ffmpeg and ImageMagick only. `demo/` media left out. |
| `anatomy/` | github.com/wheresryan22/anatomy | `1482e8469b0a` | MIT | Scripts spawn local headless Chrome only. `scripts/publish.mjs` pushes to the public Anatomy gallery: **never run it unless the user asks to publish**. Built example pages, PDFs, images, tests and evals left out (rebuild with `node examples/<name>/build.mjs`). |
| `hairline-create/`, `hairline-adopt/` | github.com/lucasmarkes/hairline | `37d2e78dcb33` | MIT | `look.mjs` / `validate.mjs` run node and npm locally. |
| `motion-design/` | github.com/LottieFiles/motion-design-skill | `f9a8a041b851` | MIT | Markdown only. |
| `motion/` | github.com/motiondivision/ai-kit (`plugins/motion`) | `0ebeb5313a06` | MIT | Markdown only. Docs search, audits and the transition editor need the hosted MCP servers `https://mcp.motion.dev` (free) / `https://mcp.motion.dev/plus` (paid); without them use `best-practices/` and `css-spring/`. `motion-reviewer-agent.md` is the upstream review agent prompt. |

Not vendored (installed elsewhere):

| Tool | Where it lives | Why |
|---|---|---|
| GSAP, react-three-rapier, react-postprocessing | `video-studio/package.json` (exact versions) | npm libraries, not skills |
| blender-agents | github.com/scenario-labs/blender-plugin | GPL-3.0 Blender add-on (67 MB). Needs Blender on the user's own machine; install it there from the repo's README. |
| Openverse | `video-studio/scripts/openverse.mjs` | Web API, no install. |

To update a tool: clone it, diff against the folder here, read the changes, copy, and update the commit in this table.
