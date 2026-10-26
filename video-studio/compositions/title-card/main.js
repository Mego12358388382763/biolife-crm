// 9:16 kinetic title card: GSAP timeline, Arabic RTL text, counter, checklist.
// Easing follows the motion-design skill: ease-out (expo/power3) for entrances,
// ease-in for exits, 60–90 ms staggers, a small anticipation dip on the hero word.
import "@fontsource-variable/cairo";
import gsap from "gsap";
import { registerStudio } from "../studio.js";
import "./style.css";

const FPS = 30;
const DURATION = 7;

const tl = gsap.timeline({ paused: true });
const counter = { value: 0 };
const num = document.querySelector(".num");

tl.from(".glow", { opacity: 0, scale: 0.6, duration: 1.4, ease: "power2.out" }, 0)
  .from(".kicker", { y: 40, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.2)
  .from(".word", { y: 120, opacity: 0, filter: "blur(18px)", duration: 0.9, ease: "expo.out", stagger: 0.09 }, 0.35)
  .to(".highlight", { scale: 0.94, duration: 0.18, ease: "power2.in" }, 1.25)
  .to(".highlight", { scale: 1, duration: 0.6, ease: "back.out(3)" }, 1.43)
  .from(".counter", { y: 60, opacity: 0, duration: 0.7, ease: "power3.out" }, 1.6)
  .to(counter, { value: 92, duration: 1.6, ease: "power2.out", onUpdate: () => (num.textContent = Math.round(counter.value)) }, 1.7)
  .from(".list li", { x: -80, opacity: 0, duration: 0.6, ease: "power3.out", stagger: 0.12 }, 2.6)
  .from(".tick", { scale: 0, duration: 0.5, ease: "back.out(2.5)", stagger: 0.12 }, 2.8)
  .from(".cta", { y: 50, opacity: 0, duration: 0.7, ease: "power3.out" }, 3.8)
  .to(".stage > :not(.glow)", { y: -40, opacity: 0, duration: 0.5, ease: "power2.in", stagger: 0.04 }, DURATION - 0.8);

await document.fonts.ready;

registerStudio({
  width: 1080,
  height: 1920,
  fps: FPS,
  duration: DURATION,
  seek: (frame) => {
    tl.seek(frame / FPS, false);
  },
});
