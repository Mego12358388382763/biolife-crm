import "@fontsource-variable/cairo";
import { buildReel } from "../reel.js";
import words from "./words.json";
import { format, hot, scenes } from "./scenes.js";
import "./style.css";

await document.fonts.ready;

buildReel({
  words,
  format,
  hot,
  scenes,
  stage: document.querySelector(".scenes"),
  captionsEl: document.querySelector(".captions"),
});
