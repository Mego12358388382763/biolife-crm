// Step 5 "describe the scene, don't animate it by hand": each scene starts with
// the plain-language description it was built from. Times come from the voice
// (at("word") = when that word is spoken), never from hand-set keyframes.

export const format = { width: 1080, height: 1920, fps: 60, tail: 0.8 };

// Words that get the gold highlight, a bounce and a pop sound.
export const hot = ["After", "Effects", "كود", "Claude"];

export const scenes = [
  {
    // "A huge question mark rises out of a soft gold glow while the hook is asked."
    start: () => 0,
    build: ({ layer, tl }) => {
      layer.innerHTML = `<div class="glow-orb"></div><div class="qmark">؟</div>`;
      tl.from(layer.querySelector(".glow-orb"), { scale: 0.3, opacity: 0, duration: 1.2, ease: "power2.out" }, 0)
        .from(layer.querySelector(".qmark"), { y: 160, opacity: 0, rotate: -12, duration: 0.9, ease: "expo.out" }, 0.15)
        .to(layer.querySelector(".qmark"), { rotate: 6, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: 1 }, 1);
    },
  },
  {
    // "An After Effects tile slams in; when 'Effects' is said a red line slashes it out and it shakes."
    start: ({ at }) => at("After") - 0.15,
    sound: "sfx/whoosh.wav",
    build: ({ layer, tl, endOf, cue }) => {
      layer.innerHTML = `<div class="tile ae"><span>Ae</span><i class="slash"></i></div><p class="label">After Effects</p>`;
      const slashAt = endOf("Effects") - 0.1;
      tl.from(layer.querySelector(".tile"), { scale: 1.6, opacity: 0, duration: 0.45, ease: "expo.out" }, 0)
        .from(layer.querySelector(".label"), { y: 40, opacity: 0, duration: 0.4, ease: "power3.out" }, 0.12)
        .fromTo(layer.querySelector(".slash"), { scaleX: 0 }, { scaleX: 1, duration: 0.22, ease: "power4.out" }, slashAt)
        .to(layer.querySelector(".tile"), { x: 18, duration: 0.05, repeat: 5, yoyo: true, ease: "none" }, slashAt + 0.2)
        .to(layer.querySelector(".tile"), { filter: "grayscale(1) brightness(0.5)", duration: 0.3 }, slashAt + 0.25);
      cue("sfx/hit.wav", slashAt, 0.9);
    },
  },
  {
    // "A code window types a few lines, then 'كود' makes every line collapse to a big 0."
    start: ({ at }) => at("ومن") - 0.1,
    build: ({ layer, tl, at, cue }) => {
      layer.innerHTML = `
        <div class="window">
          <div class="dots"><i></i><i></i><i></i><b>script.js</b></div>
          <pre class="code"><span>const scene = animate(</span><span>  title, { y: 0 }</span><span>);</span></pre>
          <div class="zero">0 <small>سطر كود</small></div>
        </div>`;
      const lines = layer.querySelectorAll(".code span");
      tl.from(layer.querySelector(".window"), { y: 80, opacity: 0, duration: 0.5, ease: "expo.out" }, 0);
      lines.forEach((l, i) => tl.from(l, { width: 0, duration: 0.35, ease: "steps(14)" }, 0.3 + i * 0.35));
      const k = at("كود");
      tl.to(lines, { scaleY: 0, opacity: 0, duration: 0.25, stagger: 0.05, ease: "power2.in" }, k)
        .from(layer.querySelector(".zero"), { scale: 0, opacity: 0, duration: 0.6, ease: "back.out(2.5)" }, k + 0.2);
      cue("sfx/hit.wav", k + 0.2, 0.7);
    },
  },
  {
    // "Three chips drop in one by one, each on its own 'كل': word, motion, sound effect."
    start: ({ at }) => at("كل") - 0.15,
    build: ({ layer, tl, at }) => {
      layer.innerHTML = `
        <div class="chips">
          <div class="chip"><b>Aa</b> كل كلمة</div>
          <div class="chip"><b>↗</b> كل حركة</div>
          <div class="chip"><b>♪</b> كل مؤثر صوتي</div>
        </div>`;
      layer.querySelectorAll(".chip").forEach((chip, i) => {
        tl.from(chip, { y: -120, opacity: 0, rotate: i % 2 ? 4 : -4, duration: 0.55, ease: "back.out(2)" }, at("كل", i));
      });
    },
  },
  {
    // "A Claude spark blooms in gold and the word Claude stamps under it."
    start: ({ at }) => at("أنا") - 0.15,
    sound: "sfx/shimmer.wav",
    volume: 0.5,
    build: ({ layer, tl, at, cue }) => {
      layer.innerHTML = `<div class="glow-orb"></div><div class="spark">✳</div><div class="brand">Claude</div>`;
      const c = at("Claude");
      tl.from(layer.querySelector(".glow-orb"), { scale: 0.2, opacity: 0, duration: 1, ease: "power2.out" }, 0)
        .from(layer.querySelector(".spark"), { scale: 0, rotate: -180, duration: 0.9, ease: "expo.out" }, 0.1)
        .to(layer.querySelector(".spark"), { rotate: 90, duration: 3, ease: "none" }, 1)
        .from(layer.querySelector(".brand"), { scale: 2.2, opacity: 0, duration: 0.35, ease: "power4.in" }, c - 0.3);
      cue("sfx/hit.wav", c, 0.8);
    },
  },
];
