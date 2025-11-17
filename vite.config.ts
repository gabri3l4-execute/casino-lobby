import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ...(process.env.NODE_ENV === "production" // only compress in production
      ? [
          viteCompression({ algorithm: "gzip", ext: ".gz", threshold: 0 }),
          viteCompression({
            algorithm: "brotliCompress",
            ext: ".br",
            threshold: 0,
            compressionOptions: { level: 11 },
          }),
        ]
      : []),
    // compression plugins are only included above for production builds
  ],
  build: {
    outDir: "dist",
  },
  preview: {
    port: 4173, // if you want to simulate gzip/Brotli serving locally
    strictPort: true, // fail if port is already in use
  },
});
