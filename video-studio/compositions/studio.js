// The contract between a composition and scripts/render.mjs.
//
// A composition calls registerStudio() once it can draw any frame. The renderer
// then calls seek(frame) for frame = 0..totalFrames-1 and screenshots the page
// after each one, so motion must depend only on the frame number, never on the
// wall clock. In a normal browser tab (npm run dev) the composition plays live.
// cues (optional) are sound effects the composition wants under each motion,
// [{ sound: "sfx/whoosh.wav", at: 1.2, volume: 0.6 }]; the renderer saves them
// next to the video for scripts/mix.mjs.

export function registerStudio({ width, height, fps, duration, seek, cues = [] }) {
  const totalFrames = Math.round(duration * fps);
  const rendering = new URLSearchParams(location.search).has("render");

  document.documentElement.style.setProperty("--w", `${width}px`);
  document.documentElement.style.setProperty("--h", `${height}px`);

  window.__studio = {
    width,
    height,
    fps,
    duration,
    totalFrames,
    cues,
    seek: async (frame) => {
      // Only await real Promises: GSAP timelines are thenables that resolve on
      // completion, so awaiting a paused one would hang forever.
      const result = seek(frame);
      if (result instanceof Promise) await result;
      // Two rAFs: the first lets the frame's DOM/WebGL work land, the second
      // guarantees it has been painted before the screenshot.
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    },
  };

  if (!rendering) {
    let start = performance.now();
    const tick = async (now) => {
      const frame = Math.floor(((now - start) / 1000) * fps);
      if (frame >= totalFrames) start = now;
      const result = seek(Math.min(frame, totalFrames - 1));
      if (result instanceof Promise) await result;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  window.__studioReady = true;
}
