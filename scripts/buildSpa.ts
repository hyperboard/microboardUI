import { build } from "bun";
import { copyPlugin } from "../bunPlugins/copyPlugin";

async function main() {
  const result = await build({
    entrypoints: ["src/index.html"],
    target: "browser",
    conditions: ["import", "browser"],
    outdir: "public",
    loader: {
      ".css": "css",
    },
    format: "esm",
    plugins: [
      copyPlugin({
        from: "src/public",
        to: "public",
        bundle: true,
      }),
    ],
  });

  if (!result.success) process.exit(1);
}

main().catch((err) => {
  console.error("Unexpected error in build script:", err);
  process.exit(1);
});
