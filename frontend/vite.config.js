import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync("/certs/key.pem"), 
      cert: fs.readFileSync("/certs/cert.pem"),
    },
    host: true,
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      "/api": {
        target: "https://wiki-api:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});