import { build } from "bun";
import { copyPlugin } from "../bunPlugins/copyPlugin";
import { bundleCSS } from "./bundleCss";
import path from "path";
import fs from "fs";

function cleanup() {
  // resulting html has empty chunk-xxxxxxxx.js file, remove tag and file
  const htmlPath = path.join("public", "board.html");
  let html = fs.readFileSync(htmlPath, "utf-8");

  const chunkRegex =
    /<script\b[^>]*src="\.\/(chunk-[^"]+\.js)"[^>]*><\/script>\s*/;
  const match = chunkRegex.exec(html);
  if (match) {
    const [tag, chunkFile] = match;
    html = html.replace(tag, "");
    fs.writeFileSync(htmlPath, html, "utf-8");
    fs.unlinkSync(path.join("public", chunkFile));
  }
}

async function main() {
  const result = await build({
    entrypoints: ["src/board.html"],
    outdir: "public",
    loader: {
      ".css": "css",
    },
    format: "esm",
    splitting: false,
    plugins: [
      copyPlugin({
        from: "src/public",
        to: "public",
        bundle: true,
      }),
    ],
  });

  const cssResult = await bundleCSS({
    entryPoints: ["src/board.css"],
    outfile: "public/board.css",
    bundle: true,
  });

  if (!result.success || cssResult.errors.length > 0) process.exit(1);

  cleanup();
}

main().catch(console.error);
