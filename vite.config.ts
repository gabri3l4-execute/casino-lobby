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
    // generate .gz files for gzip
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 0, // compress all files
      deleteOriginFile: false,
    }),
    // generate .br files for brotli
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 0,
      compressionOptions: { level: 11 },
      deleteOriginFile: false,
    }),
  ],
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    __REACT_DEVTOOLS_GLOBAL_HOOK__: JSON.stringify({ isDisabled: true }), // disable React DevTools in production
  },
  build: {
    outDir: "dist",
  },
  preview: {
    port: 4173, // if you want to simulate gzip/Brotli serving locally
    strictPort: true, // fail if port is already in use
  },
});
