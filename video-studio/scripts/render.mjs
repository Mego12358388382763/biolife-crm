#!/usr/bin/env node
// Render a composition to MP4, frame by frame.
//
//   node scripts/render.mjs <composition> [--out out/<composition>.mp4]
//        [--audio public/audio/track.mp3] [--from 0] [--frames N] [--crf 18]
//        [--stills 0.5,3,7.2]   (contact sheet of those seconds instead of a video)
//
// Starts a Vite server, opens /<composition>/?render in headless Chromium at the
// composition's own size, calls window.__studio.seek(frame) for every frame,
// pipes the screenshots into ffmpeg (H.264, yuv420p, +faststart) and muxes the
// audio track if one is given.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { chromium } from "playwright";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const [name, ...rest] = argv;
  if (!name || name.startsWith("--")) {
    console.error("usage: node scripts/render.mjs <composition> [--out file.mp4] [--audio file] [--from 0] [--frames N] [--crf 18]");
    process.exit(1);
  }
  const opts = { name, crf: "18", from: 0 };
  for (let i = 0; i < rest.length; i += 2) opts[rest[i].replace(/^--/, "")] = rest[i + 1];
  opts.out = resolve(ROOT, opts.out ?? `out/${name}.mp4`);
  if (opts.audio) opts.audio = resolve(ROOT, opts.audio);
  return opts;
}

function launchBrowser() {
  // CHROME_PATH lets a machine with a different Playwright browser build point at any Chromium.
  return chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined,
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  });
}

const opts = parseArgs(process.argv.slice(2));
if (!existsSync(resolve(ROOT, "compositions", opts.name, "index.html"))) {
  console.error(`No composition at compositions/${opts.name}/index.html`);
  process.exit(1);
}
if (opts.audio && !existsSync(opts.audio)) {
  console.error(`Audio file not found: ${opts.audio}`);
  process.exit(1);
}
mkdirSync(dirname(opts.out), { recursive: true });

const server = await createServer({ configFile: resolve(ROOT, "vite.config.js"), server: { port: 0 }, logLevel: "error" });
await server.listen();
const url = `${server.resolvedUrls.local[0]}${opts.name}/?render`;
const browser = await launchBrowser();

try {
  const page = await browser.newPage();
  page.on("pageerror", (err) => console.error("page error:", err.message));
  await page.goto(url);
  await page.waitForFunction(() => window.__studioReady === true, null, { timeout: 60_000 });
  await page.evaluate(() => document.fonts.ready);
  const meta = await page.evaluate(() => {
    const { width, height, fps, totalFrames, cues } = window.__studio;
    return { width, height, fps, totalFrames, cues };
  });
  await page.setViewportSize({ width: meta.width, height: meta.height });

  if (opts.stills) {
    // Contact sheet for review before a full render: --stills 0.5,3,7.2 (seconds).
    const times = opts.stills.split(",").map(Number);
    const sheet = opts.out.replace(/\.mp4$/, "-sheet.jpg");
    const shots = [];
    for (const t of times) {
      await page.evaluate((f) => window.__studio.seek(f), Math.min(meta.totalFrames - 1, Math.round(t * meta.fps)));
      shots.push(await page.screenshot({ type: "png" }));
    }
    const inputs = shots.flatMap((_, i) => ["-f", "image2pipe", "-i", `pipe:${i + 3}`]);
    const scale = shots.map((_, i) => `[${i}]scale=-1:640,drawtext=text='${times[i]}s':x=16:y=16:fontsize=34:fontcolor=white:box=1:boxcolor=black@0.6[s${i}]`).join(";");
    const stack = `${shots.map((_, i) => `[s${i}]`).join("")}hstack=inputs=${shots.length}`;
    const ff = spawn(
      process.env.FFMPEG_PATH || "ffmpeg",
      ["-y", "-loglevel", "error", ...inputs, "-filter_complex", shots.length > 1 ? `${scale};${stack}` : scale.replace("[s0]", ""), "-frames:v", "1", sheet],
      {
        stdio: ["ignore", "inherit", "inherit", ...shots.map(() => "pipe")],
      },
    );
    shots.forEach((png, i) => ff.stdio[i + 3].end(png));
    await new Promise((ok, fail) => ff.on("close", (code) => (code === 0 ? ok() : fail(new Error(`ffmpeg exited ${code}`)))));
    console.log(`wrote ${sheet}`);
  } else {
    const from = Number(opts.from);
    const count = Math.min(Number(opts.frames ?? meta.totalFrames), meta.totalFrames - from);
    console.log(`${opts.name}: ${meta.width}x${meta.height} @ ${meta.fps}fps, frames ${from}..${from + count - 1}`);

    const args = ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(meta.fps), "-i", "-"];
    if (opts.audio) args.push("-i", opts.audio);
    args.push("-c:v", "libx264", "-preset", "medium", "-crf", opts.crf, "-pix_fmt", "yuv420p", "-r", String(meta.fps));
    if (opts.audio) args.push("-c:a", "aac", "-b:a", "192k", "-shortest");
    args.push("-movflags", "+faststart", opts.out);
    const ffmpeg = spawn(process.env.FFMPEG_PATH || "ffmpeg", args, { stdio: ["pipe", "inherit", "inherit"] });
    const done = new Promise((ok, fail) => ffmpeg.on("close", (code) => (code === 0 ? ok() : fail(new Error(`ffmpeg exited ${code}`)))));

    for (let i = 0; i < count; i++) {
      await page.evaluate((f) => window.__studio.seek(f), from + i);
      const png = await page.screenshot({ type: "png" });
      if (!ffmpeg.stdin.write(png)) await new Promise((r) => ffmpeg.stdin.once("drain", r));
      if ((i + 1) % meta.fps === 0 || i === count - 1) process.stdout.write(`\r  ${i + 1}/${count}`);
    }
    ffmpeg.stdin.end();
    await done;
    console.log(`\n  wrote ${opts.out}`);
    if (meta.cues?.length) {
      const cuesFile = opts.out.replace(/\.mp4$/, ".cues.json");
      writeFileSync(cuesFile, JSON.stringify(meta.cues, null, 2) + "\n");
      console.log(`  wrote ${cuesFile} (${meta.cues.length} sound cues)`);
    }
  }
} finally {
  await browser.close();
  await server.close();
}
