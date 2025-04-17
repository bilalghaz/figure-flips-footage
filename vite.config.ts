
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Make sure base is set to './' for Electron
  base: './',
  // Adjust build configuration for Electron
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Set target to achieve better compatibility
    target: 'esnext',
    // Make sure Electron can access the built files
    assetsDir: 'assets',
  }
}));
