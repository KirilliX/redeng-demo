import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.VITE_ASSET_BASE ?? "/",
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 4173,
    proxy: {
      "/api": "http://127.0.0.1:8787",
      "/landing-api": "http://127.0.0.1:8787",
      "/uploads": "http://127.0.0.1:8787",
      "/landing-uploads": "http://127.0.0.1:8787",
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
