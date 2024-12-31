import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitePluginChecker from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    !process.env.VITEST
      ? vitePluginChecker({
          eslint: {
            lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
            useFlatConfig: false,
          },
          typescript: true,
          overlay: {
            initialIsOpen: false,
          },
        })
      : undefined,
  ],
});
