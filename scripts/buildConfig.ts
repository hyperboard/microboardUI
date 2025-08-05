import { BuildConfig } from "bun";

export const outdir = "dist";
export const entrypoints = [
  "src/board.html",
  "src/index.ts",
  "src/example.html",
];
export const baseConfig: BuildConfig = {
  entrypoints,
  outdir,
  loader: {
    ".css": "css",
    ".svg": "text",
  },

  publicPath: "/",
  format: "esm",
  splitting: false,
};
