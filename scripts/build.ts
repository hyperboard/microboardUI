import { build } from "bun";
import { copyPlugin } from "../bunPlugins/copyPlugin";
import path from "path";
import fs from "fs";

const outdir = "dist";

function cleanup() {
  // resulting html has empty chunk-xxxxxxxx.js file, remove tag and file
  const htmlPath = path.join(outdir, "board.html");
  let html = fs.readFileSync(htmlPath, "utf-8");

  const chunkRegex =
    /<script\b[^>]*src="\.\/(chunk-[^"]+\.js)"[^>]*><\/script>\s*/;
  const match = chunkRegex.exec(html);
  if (match) {
    const [tag, chunkFile] = match;
    html = html.replace(tag, "");
    fs.writeFileSync(htmlPath, html, "utf-8");
    fs.unlinkSync(path.join(outdir, chunkFile));
  }
}

async function main() {
  const result = await build({
    entrypoints: ["src/board.html", "src/index.ts"],
    outdir,
    loader: {
      ".css": "css",
    },
    format: "esm",
    splitting: false,
    plugins: [
      copyPlugin({
        from: "src/public",
        to: outdir,
        bundle: true,
      }),
      copyPlugin({
        from: "src/board.css",
        to: outdir,
        bundle: true,
      }),
    ],
  });

  if (!result.success) process.exit(1);

  cleanup();
}

main().catch(console.error);
