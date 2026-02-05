import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isGhPages = process.env.GH_PAGES === "true";

export default defineConfig({
  base: isGhPages ? "/OT-hieraki/" : "/",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
