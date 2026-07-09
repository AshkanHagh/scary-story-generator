import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: "./test",
  resolve: {
    tsconfigPaths: true,
  },
  esbuild: false,
  oxc: false,
  test: {
    hookTimeout: 1000 * 60 * 5,
    testTimeout: 1000 * 30,
    teardownTimeout: 1000 * 30,
    setupFiles: ["./setup.ts"],
    clearMocks: true,
    passWithNoTests: true,
  },
  plugins: [
    swc.vite({
      module: {
        type: "es6",
      },
    }),
  ],
});
