import { defineConfig } from "vite";
import angular from "@analogjs/vite-plugin-angular";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [angular({ tsconfig: resolve(__dirname, "tsconfig.json") })],
});
