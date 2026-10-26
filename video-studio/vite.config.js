import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Every folder under compositions/ is one video, served at /<name>/.
export default defineConfig({
  root: fileURLToPath(new URL("./compositions", import.meta.url)),
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [react()],
  server: { host: "127.0.0.1" },
});
