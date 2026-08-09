import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: parseInt(process.env.VITE_PORT || "8000", 10),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
