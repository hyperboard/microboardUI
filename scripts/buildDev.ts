import { build } from "bun";
import { copyPlugin } from "../bunUtils/copyPlugin";
import { inlineLinks } from "../bunUtils/inlineLinks";

const outdir = "dist";

async function main() {
  const result = await build({
    entrypoints: ["src/board.html", "src/index.ts", "src/example.html"],
    outdir,
    loader: {
      ".css": "css",
      ".svg": "file",
      // ".html": "file",
    },
    publicPath: "/",
    format: "esm",
    splitting: false,
    plugins: [
      copyPlugin({
        from: "src/public",
        to: outdir,
        bundle: true,
      }),
      copyPlugin({
        from: "src/shared/ui-lib/Icon/sprite.svg",
        to: outdir,
      }),
    ],
  });

  if (!result.success) process.exit(1);

  await inlineLinks("dist/board.html", "dist");
}

main().catch(console.error);
